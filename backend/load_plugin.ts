import fs from "node:fs/promises";
import path from "node:path";
import type { ComponentGenerator } from "~/model/factory";

export class Plugin {
  name: string;
  gen: ComponentGenerator;

  constructor(name: string, gen: ComponentGenerator) {
    this.name = name;
    this.gen = gen;
  }

  get type(): string {
    const pattern = /^mrdamian-plugin-(?<type>.*)$/;
    const found = this.name.match(pattern);
    if (!found) return "";
    if (!found.groups?.type) return "";
    return found.groups?.type;
  }
}

export class PluginLoader {
  base: string;
  plugins: Plugin[];
  constructor(base: string) {
    this.base = base;
    this.plugins = [];
  }

  async scan(): Promise<Plugin[]> {
    const dirs = await fs.readdir(this.base);
    const plugins = [];
    for (const dir in dirs) {
      const plugin = await this.load(dir);
      if (!plugin) continue;
      plugins.push(plugin);
    }
    return plugins;
  }

  async load(dir: string): Promise<Plugin | undefined> {
    const f = Bun.file(path.join(dir, "package.json"));
    if (!f.exists()) {
      return undefined;
    }
    const metadata = JSON.parse(await f.text()) as {
      name?: string;
      main?: string;
      dependencies?: Record<string, string>;
    };
    if (!metadata.name) {
      return undefined;
    }
    if (!metadata.main) {
      return undefined;
    }
    if (!metadata.dependencies?.mrdamian) {
      return undefined;
    }

    const gen = await import(path.join(dir, metadata.main));

    return new Plugin(metadata.name, gen.default);
  }
}
