import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
} from './config';

import { Environment, evaluate } from './variable';

import { EventSender } from './events';
import { Component } from './component';


export class Module {
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(config: ModuleConfig, pipeline: Pipeline) {
    this.config = config;
    this.pipeline = pipeline;
  }

  run(init: Environment): Environment {
    return this.pipeline.reduce((env, comp) => {
      const args = evaluate(comp.config, env)
      const rets = comp.runRaw({...env, ...args});
      return {...env, [comp.config.name]: rets };
    }, init);
  }
}

export type Pipeline = Component<ComponentConfig>[];

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
