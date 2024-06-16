import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  type CallConfig,
  isCallConfig,
} from './parameters';

import { Environment } from './variable';
import { EventEmitter, NamedEventEmitter } from './events';
import { Component, ComponentWithConfig } from './component';
import { Pipeline } from './pipeline';
import { Module } from './module';

export interface ComponentConstructor<T extends ComponentConfig> {
  new (emitter: NamedEventEmitter): Component<T>;
}

export type ComponentConstructors = {
  [key: string]: ComponentConstructor<ComponentConfig>;
};

export class ModuleFactory {
  readonly constructors: ComponentConstructors;
  readonly emitter: EventEmitter;

  instances: Map<string, Component<ComponentConfig>>;

  constructor(constructors: ComponentConstructors, emitter: EventEmitter) {
    this.constructors = constructors;
    this.emitter = emitter;
    this.instances = new Map();
  }

  constructModule(params: ModuleConfig): Module {
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline);
  }

  constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructComponentWithConfig(params));
  }

  constructComponentWithConfig(
    config: ComponentConfig,
  ): ComponentWithConfig<ComponentConfig> {
    // filter if key is undefined.
    const keys = [config.type, config.name].filter((v) => v);
    const key = JSON.stringify(keys);
    const emitter = new NamedEventEmitter(this.emitter, keys);

    // Call component should not be cached because Call is system component.
    if (isCallConfig(config)) {
      return new ComponentWithConfig(new Call(config, emitter, this), config);
    }

    let component = this.instances.get(key);
    if (!component) {
      component = this.constructComponent(config, emitter);
      this.instances.set(key, component);
    }
    return new ComponentWithConfig(component, config);
  }

  constructComponent(
    config: ComponentConfig,
    emitter: NamedEventEmitter,
  ): Component<ComponentConfig> {
    const constructor = this.constructors[config.type];
    if (!constructor) {
      console.log(`Unsupported component: ${config.type}`);
      return new Unsupported(emitter);
    }
    return new constructor(emitter);
  }
}

class Call extends Component<CallConfig> {
  submodule: Module;

  constructor(
    config: CallConfig,
    emitter: NamedEventEmitter,
    factory: ModuleFactory,
  ) {
    super(emitter);
    // TODO: validate params with some schema.
    this.submodule = factory.constructModule(config.module);
  }

  async init(config: CallConfig): Promise<Environment> {
    return await this.submodule.init(config.args);
  }

  async run(config: CallConfig): Promise<Environment> {
    return await this.submodule.run(config.args);
  }
}

class Unsupported extends Component<ComponentConfig> {
  async run(): Promise<Environment> {
    // just ignore all things.
    return undefined;
  }
}
