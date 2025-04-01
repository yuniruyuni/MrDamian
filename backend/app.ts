import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import { load } from "~/backend/load_config";
import { ModuleLoader } from "~/backend/load_module";

import { type ModuleConfig, asParams } from "~/model/config";
import { EmitterStack } from "~/model/events";
import { ModuleFactory } from "~/model/factory";
import type { Module } from "~/model/module";

const mainModulePath = "./config/main.json5";

export class App {
  route: Hono;
  params: ModuleConfig;
  module?: Module;
  loader: ModuleLoader;
  running: boolean;

  constructor() {
    this.route = new Hono();
    this.params = {
      inherit: {},
      params: asParams({}),
      pipeline: [],
    };

    this.loader = new ModuleLoader();
    this.running = false;
  }

  fetch(req: Request): Promise<Response> | Response {
    return this.route.fetch(req);
  }

  async load() {
    await this.loader.loadConfig();
    const gens = await this.loader.loadAll();
    const stack = new EmitterStack();
    const factory = new ModuleFactory(gens, stack);
    this.params = await load(mainModulePath);
    this.module = factory.construct(this.params);

    const route = new Hono();
    await this.constructRoutes(route);
    this.route = route;

    await this.module.initialize({});

    this.running = false;
  }

  async start() {
    if (this.running) return;
    this.running = true;

    if (!this.module) return;
    // accquire mod because this.module will be undefined after unload.
    const mod = this.module;
    await mod.start({});
    while (!mod.aborted) {
      await mod.receive();
    }
  }

  async stop() {
    if (!this.running) return;

    if (this.module !== undefined) {
      await this.module.stop({});
    }
    this.running = false;
  }

  async unload() {
    if (this.module) {
      await this.module.finalize({});
      this.module = undefined;
    }
  }

  async reload() {
    const restart = this.running;
    await this.stop();
    await this.unload();
    await this.load();
    if (restart) this.start();
  }

  async constructRoutes(route: Hono) {
    route.get("/-/api/module", async (c) => {
      return c.json(this.params);
    });

    route.post("/-/api/module/start", async (c) => {
      if (this.running) return c.json({ status: "running" });
      this.start();
      return c.json({ status: "ok" });
    });

    route.post("/-/api/module/stop", async (c) => {
      if (!this.running) return c.json({ status: "not running" });
      this.stop();
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
