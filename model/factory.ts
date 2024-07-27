import type { Action, Component } from "mrdamian-plugin";

import { type FilledComponent, fillComponent } from "~/model/component";
import {
  type ModuleConfig,
  type PipelineConfig,
  type RawAction,
  isSubmoduleAction,
} from "~/model/config";
import { Evaluator } from "~/model/evaluator";
import {
  type EmitterStack,
  type EventAbsorber,
  NamedEventEmitter,
} from "~/model/events";
import { type Instances, newInstances } from "~/model/instances";
import { Module } from "~/model/module";
import type { Pipeline } from "~/model/pipeline";
import { Submodule } from "~/model/submodule";
import { Unsupported } from "~/model/unsupported";

// ComponentGenerator is a constructive object type.
export interface ComponentGenerator<
  T extends Action = Action,
> {
  new (): Component<T>;
}

export type ComponentGenerators = {
  [key: string]: ComponentGenerator<Action>;
};

export class ModuleFactory {
  private readonly gens: ComponentGenerators;
  private readonly absorber: EventAbsorber;
  private readonly stack: EmitterStack;

  private instances: Instances;

  public constructor(
    gens: ComponentGenerators,
    stack: EmitterStack,
  ) {
    this.gens = gens;
    this.instances = newInstances();

    const [child, absorber] = stack.spawn();
    this.stack = child;
    this.absorber = absorber;
  }

  public construct(
    params: ModuleConfig,
    inherited: Instances = newInstances(),
  ): Module {
    this.instances = inherited;
    const pipeline = this.constructPipeline(params.pipeline);
    return new Module(params, pipeline, this.absorber, this.instances);
  }

  private constructPipeline(pipeline: PipelineConfig): Pipeline {
    return pipeline.map((params) => this.constructEvaluator(params));
  }

  private constructEvaluator(
    action: RawAction,
  ): Evaluator<Action> {
    // filter if key is undefined.
    const keys: string[] = [action.type, action.name].filter(
      (v) => v !== undefined,
    );
    const key = keys.join("/");
    const emitter = new NamedEventEmitter(this.stack, keys);

    // Call component should not be cached because Call is system component.
    if (isSubmoduleAction(action)) {
      return new Evaluator(
        fillComponent(new Submodule(action, this.stack, this.gens, this.instances)),
        action,
        emitter,
      );
    }

    const component = this.instances.get(key) || this.constructFilledComponent(action);
    this.instances.set(key, component);
    return new Evaluator(component, action, emitter);
  }

  private constructFilledComponent(config: Action): FilledComponent<Action> {
    return fillComponent(this.constructComponent(config));
  }

  private constructComponent(config: Action): Component<Action> {
    const gen = this.gens[config.type];
    if (!gen) {
      console.log(`Unsupported component: ${config.type}`);
      return new Unsupported();
    }
    return new gen();
  }
}
