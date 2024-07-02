import path from "node:path";
import JSON5 from "json5";
import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";
import type { ComponentGenerator, ComponentGenerators } from "~/model/factory";
import type { PluginInfo } from "~/model/plugin";

export class Plugin {
  name: string;
  version: string;
  gen: ComponentGenerator;

  constructor(name: string, version: string, gen: ComponentGenerator) {
    this.name = name;
    this.version = version;
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

export type InstalledPlugin = {
  name: string;
  version: string;
};

export class PluginLoader {
  base: string;
  plugins: InstalledPlugin[];
  manager: PluginManager;

  constructor(base: string) {
    this.base = base;
    this.plugins = [];
    this.manager = new PluginManager({ pluginsPath: base });
  }

  async search(name: string): Promise<PluginInfo[]> {
    const packages = await search(name);
    return packages.map(
      (pkg) =>
        ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          installed: this.isInstalled(pkg.name),
        }) as PluginInfo,
    );
  }

  isInstalled(name: string): boolean {
    return this.plugins.some((p) => p.name === name);
  }

  async loadConfig(path: string): Promise<void> {
    const pluginsFile = Bun.file(path);
    this.plugins = (await pluginsFile.exists())
      ? JSON5.parse(await pluginsFile.text())
      : [];
  }

  async saveConfig(path: string): Promise<void> {
    const pluginsFile = Bun.file(path);
    Bun.write(pluginsFile, JSON5.stringify(this.plugins, null, 2));
  }

  async installFromNpm(name: string, version?: string): Promise<void> {
    const res = await this.manager.installFromNpm(name, version);

    this.plugins.push({
      name: res.name,
      version: res.version,
    });
  }

  async loadAll(): Promise<ComponentGenerators> {
    // TODO: find a better way for resolving plugin-dependency pacakge import path.
    return Object.fromEntries(
      (
        await Promise.all(
          this.plugins.map(async (pkg) => {
            const info = await this.manager.install(pkg.name, pkg.version);
            const plugin = await this.load(info.location);
            if (!plugin) return [];
            if (!plugin.type) return [];
            return [[plugin.type, plugin.gen]];
          }),
        )
      ).flat(),
    );
  }

  async load(dir: string): Promise<Plugin | undefined> {
    const f = Bun.file(path.join(dir, "package.json"));
    if (!f.exists()) {
      return undefined;
    }
    const metadata = JSON.parse(await f.text()) as {
      name: string;
      version: string;
      main?: string;
      dependencies?: Record<string, string>;
    };
    if (!metadata.main) {
      return undefined;
    }
    if (!metadata.dependencies?.mrdamian) {
      return undefined;
    }

    const gen = await import(path.join(dir, metadata.main));

    return new Plugin(metadata.name, metadata.version, gen.default);
  }
}
