import { parse, EvalAstFactory } from 'jexpr';

import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
} from './config';

import { Value, ObjectValue, Variables } from './variable';

import { EventSender } from './events';

function evaluateVariables(target: Variables, envs: Variables): Variables {
  return Object.fromEntries(Object.entries(target).map(([key, val]) => {
    if( val.type !== "expression" ) return [key, val];

    const astFactory = new EvalAstFactory();
    const expr = parse(val.value, astFactory);
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

  run(init: Variables, sender: EventSender): Variables {
    return this.pipeline.reduce((env, comp) => {
      const args = evaluateVariables(comp.variables, env)
      const rets = comp.run({...env, ...args}, sender);
      const retvars: ObjectValue = { type: "object", value: rets };
      return {...env, [comp.config.name]: retvars };
    }, init);
  }
}

export type Pipeline = Component[];

export abstract class Component {
  config: ComponentConfig;
  variables: Variables;

  constructor(config: ComponentConfig, variables: Variables) {
    this.config = config;
    this.variables = variables;
  }

  abstract run(args: Variables, sender: EventSender): Variables;
}

export interface ComponentConstructor {
  new (config: ComponentConfig, variables: Variables): Component;
}

export type ComponentConstructors = {
  [key: string]: ComponentConstructor
};

export class ModuleFactory {
  readonly constructors: ComponentConstructors;
  constructor(constructors: ComponentConstructors) {
    this.constructors = constructors;
  }

  constructModule(config: ModuleConfig): Module {
    const pipeline = this.constructPipeline(config.pipeline);
    return new Module( config, pipeline );
  }

  constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((config) => this.constructComponent(config));
  }

  constructComponent(config: ComponentConfig): Component {
    const variables = this.constructVariables(config);

    // call is system component so it's special case.
    if( config.type === "call" ) {
      return new Call(config as CallConfig, variables, this);
    }

    const constructor = this.constructors[config.type];
    if( !constructor ) {
      console.log(`Unsupported component: ${config.type}`)
      return new Unsupported(config, variables);
    }
    return new constructor(config, variables);
  }

  constructVariables(vars: { [key: string]: any }): Variables {
    return Object.fromEntries(
      Object.entries(vars).map(([key, val]) => [key, this.convertValue(val)])
    );
  }

  convertValue(val: any): Value {
    switch(true) {
      case (typeof val === "string"):
      {
        const trimed = val.trim();
        if( trimed.length !== 0 && trimed[0] === "$" && trimed[1] !== "$" ) return { type: "expression", value: val };
        return { type: "string", value: val };
      }
      case (typeof val === "number"):
        return { type: "number", value: val };
      case (typeof val === "boolean"):
        return { type: "boolean", value: val };
      case (typeof val === "object") && Array.isArray(val):
        return { type: "array", value: val.map((v) => this.convertValue(v)) };
      case (typeof val === "object") && !Array.isArray(val):
        return { type: "object", value: this.constructVariables(val) };
      default:
        console.warn("unsupported variable type");
        return undefined;
    }
  }
}

class Call {
    config: CallConfig
    variables: Variables;
    submodule: Module;

    constructor(config: CallConfig, variables: Variables, factory: ModuleFactory) {
        this.config = config;
        this.variables = variables;

        this.submodule = factory.constructModule(this.config.module);
    }

    run(env: Variables, sender: EventSender): Variables {
        return this.submodule.run(env, sender);
    }
}

class Unsupported {
    config: ComponentConfig
    variables: Variables;

    constructor(config: ComponentConfig, variables: Variables) {
        this.config = config;
        this.variables = variables;
    }

    run(): Variables {
        // just ignore all things.
        return {};
    }
}