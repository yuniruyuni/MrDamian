import {
  type CallConfig,
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  isCallConfig,
} from "./parameters";

import { Component } from "./component";
import { Evaluator } from "./evaluator";
import {
  type EventAbsorber,
  type EventEmitter,
  NamedEventEmitter,
  eventChannel,
} from "./events";
import { Module } from "./module";
import type { Pipeline } from "./pipeline";
import type { Field } from "./variable";

export interface ComponentGenerator<
  T extends ComponentConfig = ComponentConfig,
> {
  new (emitter: NamedEventEmitter): Component<T>;
}

export type ComponentGenerators = {
  [key: string]: ComponentGenerator<ComponentConfig>;
};

export class ModuleFactory {
  readonly gens: ComponentGenerators;
  readonly emitter: EventEmitter;
  readonly absorber: EventAbsorber;

  instances: Map<string, Component<ComponentConfig>>;

  constructor(gens: ComponentGenerators) {
    this.gens = gens;
    this.instances = new Map();

    const [emitter, absorber] = eventChannel();
    this.emitter = emitter;
    this.absorber = absorber;
  }

  constructModule(params: ModuleConfig): Module {
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline, this.absorber);
  }

  constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructEvaluator(params));
  }

  constructEvaluator(
    config: ComponentConfig,
  ): Evaluator<ComponentConfig> {
    // filter if key is undefined.
    const keys: string[] = [config.type, config.name].filter(
      (v): v is string => v !== undefined,
    );
    const key = JSON.stringify(keys);
    const emitter = new NamedEventEmitter(this.emitter, keys);

    // Call component should not be cached because Call is system component.
    if (isCallConfig(config)) {
      return new Evaluator(
        new Call(config, emitter, this.gens),
        config,
      );
    }

    let component = this.instances.get(key);
    if (!component) {
      component = this.constructComponent(config, emitter);
      this.instances.set(key, component);
    }
    return new Evaluator(component, config);
  }

  constructComponent(
    config: ComponentConfig,
    emitter: NamedEventEmitter,
  ): Component<ComponentConfig> {
    const gen = this.gens[config.type];
    if (!gen) {
      console.log(`Unsupported component: ${config.type}`);
      return new Unsupported(emitter);
    }
    const comp = new gen(emitter);
    if( comp.initialize === undefined ) {
      console.warn(`component '${config.type}' doesn't have initialize method`);
    }
    if( comp.process === undefined ) {
      console.warn(`component '${config.type}' doesn't have process method`);
    }
    if( comp.finalize === undefined ) {
      console.warn(`component '${config.type}' doesn't have finalize method`);
    }

    return comp;
  }
}

// TODO: rename as Submodule
// TODO: allow direct definition submodule (not file path but configure object.)
export class Call extends Component<CallConfig> {
  factory: ModuleFactory;
  submodule: Module;

  constructor(
    config: CallConfig,
    emitter: NamedEventEmitter,
    gens: ComponentGenerators,
  ) {
    // TODO: validate params with some schema.
    super(emitter);
    this.factory = new ModuleFactory(gens);
    this.submodule = this.factory.constructModule(config.module);
  }

  async initialize(config: CallConfig): Promise<void> {
    return this.submodule.initialize(config.args ?? {});
  }

  async process(config: CallConfig): Promise<Field> {
    return this.submodule.process(config.args ?? {});
  }

  async finalize(config: CallConfig): Promise<void> {
    return this.submodule.finalize(config.args ?? {});
  }

  async receive(): Promise<void> {
    return this.submodule.receive();
  }
}

class Unsupported extends Component<ComponentConfig> {
  async process(): Promise<Field> {
    // just ignore all things.
    return undefined;
  }
}
