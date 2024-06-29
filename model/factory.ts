import type { Component } from "./component";
import {
  type ComponentConfig,
  type ModuleConfig,
  type PipelineConfig,
  isSubmoduleConfig,
} from "./config";
import { Evaluator } from "./evaluator";
import {
  type EventAbsorber,
  type EventEmitter,
  NamedEventEmitter,
  eventChannel,
} from "./events";
import { Module } from "./module";
import type { Pipeline } from "./pipeline";
import { Submodule } from "./submodule";
import { Unsupported } from "./unsupported";

export interface ComponentGenerator<
  T extends ComponentConfig = ComponentConfig,
> {
  new (emitter: NamedEventEmitter): Component<T>;
}

export type ComponentGenerators = {
  [key: string]: ComponentGenerator<ComponentConfig>;
};

export class ModuleFactory {
  private readonly gens: ComponentGenerators;
  private readonly emitter: EventEmitter;
  private readonly absorber: EventAbsorber;

  private instances: Map<string, Component<ComponentConfig>>;

  public constructor(gens: ComponentGenerators) {
    this.gens = gens;
    this.instances = new Map();

    const [emitter, absorber] = eventChannel();
    this.emitter = emitter;
    this.absorber = absorber;
  }

  public construct(
    params: ModuleConfig,
    inherited: Map<string, Component<ComponentConfig>> = new Map(),
  ): Module {
    this.instances = inherited;
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline, this.absorber);
  }

  private constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructEvaluator(params));
  }

  private constructEvaluator(
    config: ComponentConfig,
  ): Evaluator<ComponentConfig> {
    // filter if key is undefined.
    const keys: string[] = [config.type, config.name].filter(
      (v): v is string => v !== undefined,
    );
    const key = JSON.stringify(keys);
    const emitter = new NamedEventEmitter(this.emitter, keys);

    // Call component should not be cached because Call is system component.
    if (isSubmoduleConfig(config)) {
      return new Evaluator(
        new Submodule(config, emitter, this.gens, this.instances),
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

  private constructComponent(
    config: ComponentConfig,
    emitter: NamedEventEmitter,
  ): Component<ComponentConfig> {
    const gen = this.gens[config.type];
    if (!gen) {
      console.log(`Unsupported component: ${config.type}`);
      return new Unsupported(emitter);
    }
    const comp = new gen(emitter);
    if (comp.initialize === undefined) {
      console.warn(`component '${config.type}' doesn't have initialize method`);
    }
    if (comp.process === undefined) {
      console.warn(`component '${config.type}' doesn't have process method`);
    }
    if (comp.finalize === undefined) {
      console.warn(`component '${config.type}' doesn't have finalize method`);
    }

    return comp;
  }
}