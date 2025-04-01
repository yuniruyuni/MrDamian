import type { Action } from "module/lib";
import type { ComponentGenerator, ComponentGenerators } from "~/model/factory";

export class Module {
  name: string;
  gen: ComponentGenerator<Action>;

  constructor(name: string, gen: ComponentGenerator<Action>) {
    this.name = name;
    this.gen = gen;
  }
}

export type Definition = {
  name: string;
};

export class ModuleLoader {
  modules: Definition[];

  constructor() {
    this.modules = [];
  }

  async loadConfig(): Promise<void> {
    this.modules = [
      { name: "datetime" },
      { name: "deepl" },
      { name: "logger" },
      { name: "panel" },
      { name: "periodic" },
      { name: "twitch" },
      { name: "youtube" },
    ];
  }

  async loadAll(): Promise<ComponentGenerators> {
    return Object.fromEntries(
      (
        await Promise.all(
          this.modules.map(async (def) => {
            const mod = await this.load(def);
            if (!mod) return [];
            if (!mod.name) return [];
            if (!mod.gen) return [];
            return [[mod.name, mod.gen]];
          }),
        )
      ).flat(),
    );
  }

  async load(def: Definition): Promise<Module | undefined> {
    const gen = await import(`module/${def.name}`);
    return new Module(def.name, gen.default);
  }
}
