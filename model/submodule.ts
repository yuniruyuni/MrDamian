import type { Action, Component, Field } from "mrdamian-plugin";

import type { SubmoduleAction } from "~/model/config";
import type { EmitterStack } from "~/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/model/factory";
import type { Module } from "~/model/module";

// TODO: allow direct definition submodule (not file path but configure object.)
export class Submodule implements Component<SubmoduleAction> {
  factory: ModuleFactory;
  submodule: Module;

  constructor(
    action: SubmoduleAction,
    stack: EmitterStack,
    gens: ComponentGenerators,
    instances: Map<string, Component<Action>>,
  ) {
    // TODO: validate params with some schema.
    this.factory = new ModuleFactory(gens, stack);
    const inherited = new Map();

    for (const [name, type] of Object.entries(action.module.inherit)) {
      const iname = action.inherit[name];
      const instance = instances.get(`${type}/${iname}`);
      if (instance) {
        continue;
      }
      inherited.set(name, instance);
    }

    this.submodule = this.factory.construct(action.module, inherited);
  }

  async initialize(config: SubmoduleAction): Promise<void> {
    return this.submodule.initialize(config.args ?? {});
  }

  async start(config: SubmoduleAction): Promise<void> {
    return this.submodule.start(config.args ?? {});
  }

  async process(config: SubmoduleAction): Promise<Field> {
    return this.submodule.process(config.args ?? {});
  }

  async stop(config: SubmoduleAction): Promise<void> {
    return this.submodule.stop(config.args ?? {});
  }

  async finalize(config: SubmoduleAction): Promise<void> {
    return this.submodule.finalize(config.args ?? {});
  }

  async receive(): Promise<void> {
    return this.submodule.receive();
  }
}
