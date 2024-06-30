import path from "node:path";
import type { Serve } from "bun";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import search from "libnpmsearch";
import open from "open";

import { load } from "~/backend/load_config";
import { PluginLoader } from "~/backend/load_plugin";
import type { ModuleConfig } from "~/model/config";
import { ModuleFactory } from "~/model/factory";
import type { Module } from "~/model/module";
import type { PluginInfo } from "~/model/plugin";
import { asParams } from "~/model/variable";

class App {
  route: Hono;
  params: ModuleConfig;
  module?: Module;
  loader: PluginLoader;
  pluginConfigPath: string;

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
  }

  fetch(req: Request): Promise<Response> | Response {
    return this.route.fetch(req);
  }

  async run() {
    if (!this.module) return;

    await this.module.initialize({});

    while (!this.module.aborted) {
      await this.module.receive();
    }
  }

  async reload() {
    await this.loader.loadConfig(this.pluginConfigPath);
    const gens = await this.loader.loadAll();
    const factory = new ModuleFactory(gens);
    this.params = await load("./config/main.json5");
    this.module = factory.construct(this.params);

    const route = new Hono();
    this.constructRoutes(route);
    this.route = route;
  }

  async stop() {
    if (this.module !== undefined) {
      await this.module.finalize({});
    }
    this.module = undefined;
  }

  constructRoutes(route: Hono) {
    route.get("/api/module", async (c) => {
      return c.json(this.params);
    });

    route.post("/api/module/run", async (c) => {
      this.run();
      return c.json({ status: "ok" });
    });

    route.get("/api/plugin", async (c) => {
      const packages = await search("mrdamian-plugin-");
      return c.json(
        packages.map(
          (pkg) =>
            ({
              name: pkg.name,
              description: pkg.description,
              version: pkg.version,
              installed: this.loader.isInstalled(pkg.name),
            }) as PluginInfo,
        ),
      );
    });

    route.post("/api/plugin", async (c) => {
      const params = (await c.req.json()) as { name: string };
      await this.loader.installFromNpm(params.name);
      await this.loader.saveConfig(this.pluginConfigPath);

      await this.stop();
      await this.reload();
      this.run();

      return c.json({ status: "ok" });
    });

    route.use(serveStatic({ root: "static" }));

    if( this.module !== undefined) {
      this.module.mount(route);
    }
  }
}

const app = new App();
await app.reload();

// for once open browser.
// refer: https://bun.sh/docs/runtime/hot
declare global {
  var alreadyRun: boolean;
}
globalThis.alreadyRun ??= false;
if (!globalThis.alreadyRun) {
  open("http://localhost:3000");
  globalThis.alreadyRun = true;
}

export default {
  port: 3000,
  fetch: (req) => {
    // we need to fix `this` object for fetch() method,
    // so we use arrow function here.
    return app.fetch(req);
  },
} satisfies Serve;
