import path from "node:path";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import { load } from "~/backend/load_config";
import { PluginLoader } from "~/backend/load_plugin";

import { type ModuleConfig, asParams } from "~/model/config";
import { ModuleFactory } from "~/model/factory";
import type { Module } from "~/model/module";

const mainModulePath = "./config/main.json5";

export class App {
  route: Hono;
  params: ModuleConfig;
  module?: Module;
  loader: PluginLoader;
  pluginConfigPath: string;
  running: boolean;

  constructor() {
    this.route = new Hono();
    this.params = {
      inherit: {},
      params: asParams({}),
      pipeline: [],
    };

    this.pluginConfigPath = path.join(process.cwd(), "config/plugins.json5");
    const pluginsPath = path.join(process.cwd(), "node_modules");
    this.loader = new PluginLoader(pluginsPath);
    this.running = false;
  }

  fetch(req: Request): Promise<Response> | Response {
    return this.route.fetch(req);
  }

  async run() {
    if (!this.module) return;
    if (this.running) return;
    this.running = true;

    await this.module.start({});

    while (!this.module.aborted) {
      await this.module.receive();
    }
  }

  async reload() {
    await this.loader.loadConfig(this.pluginConfigPath);
    const gens = await this.loader.loadAll();
    const factory = new ModuleFactory(gens);
    this.params = await load(mainModulePath);
    this.module = factory.construct(this.params);

    const route = new Hono();
    await this.constructRoutes(route);
    this.route = route;

    await this.module.initialize({});
  }

  async stop() {
    if (this.module !== undefined) {
      await this.module.stop({});
    }
    this.running = false;
  }

  async finish() {
    if (this.module !== undefined) {
      await this.module.finalize({});
    }
    this.module = undefined;
  }

  async constructRoutes(route: Hono) {
    route.get("/-/api/module", async (c) => {
      return c.json(this.params);
    });

    route.post("/-/api/module/run", async (c) => {
      if (this.running) return c.json({ status: "running" });
      this.run();
      return c.json({ status: "ok" });
    });

    route.get("/-/api/plugin", async (c) => {
      const packages = await this.loader.search("mrdamian-plugin-");
      return c.json(packages);
    });

    route.post("/-/api/plugin", async (c) => {
      const params = (await c.req.json()) as { name: string };
      await this.loader.installFromNpm(params.name);
      await this.loader.saveConfig(this.pluginConfigPath);

      await this.stop();
      await this.finish();
      await this.reload();
      this.run();

      return c.json({ status: "ok" });
    });

    if (this.module !== undefined) {
      await this.module.mount(route);
    }

    route.get("/-/index.css", serveStatic({ path: "static/index.css" }));
    route.get("/-/index.js", serveStatic({ path: "static/index.js" }));
    route.get("/-/*", serveStatic({ path: "static/index.html" }));

    route.get("/", (c) => c.redirect("/-/"));
  }
}
