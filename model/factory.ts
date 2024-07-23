import type { Component, ComponentConfig } from "mrdamian-plugin";

import {
  type ModuleConfig,
  type PipelineConfig,
  type RawComponentConfig,
  isSubmoduleConfig,
} from "~/model/config";
import { Evaluator } from "~/model/evaluator";
import {
  type EmitterStack,
  type EventAbsorber,
  NamedEventEmitter,
  eventChannel,
} from "~/model/events";
import { type Instances, newInstances } from "~/model/instances";
import { Module } from "~/model/module";
import type { Pipeline } from "~/model/pipeline";
import { Submodule } from "~/model/submodule";
import { Unsupported } from "~/model/unsupported";

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
  private readonly absorber: EventAbsorber;
  private readonly stack: EmitterStack;

  private instances: Instances;

  public constructor(gens: ComponentGenerators, stack: EmitterStack) {
    this.gens = gens;
    this.instances = newInstances();

    const [emitter, absorber] = eventChannel();
    this.absorber = absorber;

    this.stack = stack.push(emitter);
  }

  public construct(
    params: ModuleConfig,
    inherited: Map<string, Component<ComponentConfig>> = new Map(),
  ): Module {
    this.instances = inherited;
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline, this.absorber, this.instances);
  }

  private constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructEvaluator(params));
  }

  private constructEvaluator(
    config: RawComponentConfig,
  ): Evaluator<ComponentConfig> {
    // filter if key is undefined.
    const keys: string[] = [config.type, config.name].filter(
      (v) => v !== undefined,
    );
    const key = keys.join("/");
    const emitter = new NamedEventEmitter(this.stack, keys);

    // Call component should not be cached because Call is system component.
    if (isSubmoduleConfig(config)) {
      return new Evaluator(
        new Submodule(config, emitter, this.stack, this.gens, this.instances),
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
