import { parse, EvalAstFactory } from 'jexpr';

import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
} from './config';

import { Parameters, Environment } from './variable';

import { EventSender } from './events';

function evaluateVariables<T extends Parameters>(target: T, envs: Environment): Environment {
  return Object.fromEntries(Object.entries(target).map(([key, val]) => {
    if(typeof val !== "string") return [key, val];
    if( key === "type" ) return [key, val];

    // check if it's an expression.
    if( val.length === 0 ) return [key, val];
    if( val[0] !== "$" ) return [key, val];
    if( val[0] === "$" && val[1] !== "$" ) {
      return [key, val.slice(1)];
    }

    const code = val.slice(1);
    const astFactory = new EvalAstFactory();
    const expr = parse(code, astFactory);
    // TODO: follow up the evaluate result was invalid case.
    const res = expr?.evaluate(envs);
    return [key, res];
  }));
}

export class Module {
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(config: ModuleConfig, pipeline: Pipeline) {
    this.config = config;
    this.pipeline = pipeline;
  }

  run(init: Environment): Environment {
    return this.pipeline.reduce((env, comp) => {
      const args = evaluateVariables(comp.config, env)
      const rets = comp.run({...env, ...args});
      return {...env, [comp.config.name]: rets };
    }, init);
  }
}

export type Pipeline = Component<ComponentConfig>[];

export abstract class Component<T extends ComponentConfig> {
  readonly config: T;
  readonly sender: EventSender;

  constructor(config: T, sender: EventSender) {
    this.config = config;
    this.sender = sender;
  }

  send(event: Environment) {
    this.sender.send(event);
  }

  abstract run(args: Environment): Environment;
}

export interface ComponentConstructor<T extends ComponentConfig> {
  new (config: ComponentConfig, sender: EventSender): Component<T>;
}

export type ComponentConstructors = {
  [key: string]: ComponentConstructor<ComponentConfig>;
};

export class ModuleFactory {
  readonly constructors: ComponentConstructors;
  readonly sender: EventSender;
  constructor(constructors: ComponentConstructors, sender: EventSender) {
    this.constructors = constructors;
    this.sender = sender;
  }

  constructModule(config: ModuleConfig): Module {
    const pipeline = this.constructPipeline(config.pipeline);
    return new Module( config, pipeline );
  }

  constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((config) => this.constructComponent(config));
  }

  constructComponent(config: ComponentConfig): Component<ComponentConfig> {
    // call is system component so it's special case.
    if( config.type === "call" ) {
      return new Call(config as CallConfig, this.sender, this);
    }

    const constructor = this.constructors[config.type];
    if( !constructor ) {
      console.log(`Unsupported component: ${config.type}`)
      return new Unsupported(config, this.sender);
    }
    return new constructor(config, this.sender);
  }
}

class Call extends Component<CallConfig> {
    submodule: Module;

    constructor(params: CallConfig, sender: EventSender, factory: ModuleFactory) {
      super(params, sender);
      // TODO: validate params with some schema.
      this.submodule = factory.constructModule(params.module);
    }

    run(env: Environment): Environment {
        return this.submodule.run(env);
    }
}

class Unsupported extends Component<ComponentConfig> {
    run(): Environment {
        // just ignore all things.
        return {};
    }
}
