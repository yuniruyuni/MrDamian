import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
  isCallConfig,
} from './parameters';

import { Environment } from './variable';
import { EventSender } from './events';
import { Component } from './component';
import { Pipeline } from './pipeline';
import { Module } from './module';

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

  constructModule(params: ModuleConfig): Module {
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline);
  }

  constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructComponent(params));
  }

  constructComponent(
    config: ComponentConfig,
  ): Component<ComponentConfig> {
    // call is system component so it's special case.
    if (isCallConfig(config)) {
      return new Call(config, this.sender, this);
    }

    const constructor = this.constructors[config.type];
    if (!constructor) {
      console.log(`Unsupported component: ${config.type}`);
      return new Unsupported(config, this.sender);
    }
    return new constructor(config, this.sender);
  }
}

class Call extends Component<CallConfig> {
  submodule: Module;

  constructor(
    config: CallConfig,
    sender: EventSender,
    factory: ModuleFactory,
  ) {
    super(config, sender);
    // TODO: validate params with some schema.
    this.submodule = factory.constructModule(config.module);
  }

  async init(env: Environment): Promise<Environment> {
    return await this.submodule.init(env);
  }

  async run(env: Environment): Promise<Environment> {
    return await this.submodule.run(env);
  }
}

class Unsupported extends Component<ComponentConfig> {
  async run(): Promise<Environment> {
    // just ignore all things.
    return undefined;
  }
}
