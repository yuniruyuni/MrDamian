import { Component } from "./component";
import type { ComponentConfig, SubmoduleConfig } from "./config";
import type { NamedEventEmitter, } from "./events";
import { type ComponentGenerators, ModuleFactory } from "./factory";
import type { Module } from "./module";
import type { Field } from "./variable";

// TODO: allow direct definition submodule (not file path but configure object.)
export class Submodule extends Component<SubmoduleConfig> {
  factory: ModuleFactory;
  submodule: Module;

  constructor(
    config: SubmoduleConfig,
    emitter: NamedEventEmitter,
    gens: ComponentGenerators,
    instances: Map<string, Component<ComponentConfig>>,
  ) {
    // TODO: validate params with some schema.
    super(emitter);
    this.factory = new ModuleFactory(gens);
    const inherited = new Map();

    for (const [name, type] of Object.entries(config.module.inherit)) {
      const iname = config.inherit[name];
      const instance = instances.get(`${type}/${iname}`);
      if (instance) { continue; }
      inherited.set(name, instance);
    }

    this.submodule = this.factory.construct(config.module, inherited);
  }

  async initialize(config: SubmoduleConfig): Promise<void> {
    return this.submodule.initialize(config.args ?? {});
  }

  async process(config: SubmoduleConfig): Promise<Field> {
    return this.submodule.process(config.args ?? {});
  }

  async finalize(config: SubmoduleConfig): Promise<void> {
    return this.submodule.finalize(config.args ?? {});
  }

  async receive(): Promise<void> {
    return this.submodule.receive();
  }
}