import {
  type ComponentParameters,
  type ModuleParameters,
  type PipelineParameters,
  type CallParameters,
} from './parameters';

import { Environment } from './variable';
import { EventSender } from './events';
import { Component } from './component';

export class Module {
  params: ModuleParameters;
  pipeline: Pipeline;

  constructor(params: ModuleParameters, pipeline: Pipeline) {
    this.params = params;
    this.pipeline = pipeline;
  }

  run(init: Environment): Environment {
    return this.pipeline.reduce((env, comp) => {
      const rets = comp.runRaw(env);
      return {...env, [comp.params.name]: rets };
    }, init);
  }
}

export type Pipeline = Component<ComponentParameters>[];

export interface ComponentConstructor<T extends ComponentParameters> {
  new (params: ComponentParameters, sender: EventSender): Component<T>;
}

export type ComponentConstructors = {
  [key: string]: ComponentConstructor<ComponentParameters>;
};

export class ModuleFactory {
  readonly constructors: ComponentConstructors;
  readonly sender: EventSender;
  constructor(constructors: ComponentConstructors, sender: EventSender) {
    this.constructors = constructors;
    this.sender = sender;
  }

  constructModule(params: ModuleParameters): Module {
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module( params, pipeline );
  }

  constructPipeline(pipeline: PipelineParameters): Pipeline {
    return pipeline.map((params) => this.constructComponent(params));
  }

  constructComponent(params: ComponentParameters): Component<ComponentParameters> {
    // call is system component so it's special case.
    if( params.type === "call" ) {
      return new Call(params as CallParameters, this.sender, this);
    }

    const constructor = this.constructors[params.type];
    if( !constructor ) {
      console.log(`Unsupported component: ${params.type}`)
      return new Unsupported(params, this.sender);
    }
    return new constructor(params, this.sender);
  }
}

class Call extends Component<CallParameters> {
    submodule: Module;

    constructor(params: CallParameters, sender: EventSender, factory: ModuleFactory) {
      super(params, sender);
      // TODO: validate params with some schema.
      this.submodule = factory.constructModule(params.module);
    }

    run(env: Environment): Environment {
        return this.submodule.run(env);
    }
}

class Unsupported extends Component<ComponentParameters> {
    run(): Environment {
        // just ignore all things.
        return {};
    }
}
