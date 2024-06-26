import path from "node:path";
import type { Serve } from "bun";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import JSON5 from "json5";
import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";
import open from "open";

import { load } from "~/backend/load_config";
import { PluginLoader } from "~/backend/load_plugin";
import { eventChannel } from "~/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/model/factory";
import type { PluginInfo } from "~/model/plugin";

const pluginsFile = Bun.file("config/plugins.json5");
const installedPlugins = (
  (await pluginsFile.exists()) ? JSON5.parse(await pluginsFile.text()) : []
) as { name: string; version: string }[];

// TODO: find a better way for resolving plugin-dependency pacakge import path.
const pluginsPath = path.join(process.cwd(), "node_modules");
const manager = new PluginManager({ pluginsPath });
const loader = new PluginLoader(pluginsPath);
const gens: ComponentGenerators = Object.fromEntries(
  (
    await Promise.all(
      installedPlugins.map(async (pkg) => {
        const info = await manager.install(pkg.name, pkg.version);
        const plugin = await loader.load(info.location);
        if (!plugin) return [];
        if (!plugin.type) return [];
        return [[plugin.type, plugin.gen]];
      }),
    )
  ).flat(),
);

const [emitter, absorber] = eventChannel();
const factory = new ModuleFactory(gens, emitter);
const params = await load("./config/main.json5");
const mod = factory.constructModule(params);

async function run() {
  await mod.init({});

  for await (const event of absorber) {
    await mod.run(event);
  }
}

const app = new Hono();
app.get("/api/module", async (c) => {
  return c.json(params);
});
app.post("/api/module/run", async (c) => {
  run();
  return c.json({ status: "ok" });
});
app.get("/api/plugin", async (c) => {
  const packages = await search("mrdamian-plugin-");
  return c.json(
    packages.map(
      (pkg) =>
        ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          installed: installedPlugins.some((p) => p.name === pkg.name),
        }) as PluginInfo,
    ),
  );
});
app.post("/api/plugin", async (c) => {
  const params = (await c.req.json()) as { name: string };
  const name = params.name;
  const plugin = await manager.installFromNpm(name);
  installedPlugins.push({ name: plugin.name, version: plugin.version });
  Bun.write(pluginsFile, JSON5.stringify(installedPlugins, null, 2));

  return c.json({ status: "ok" });
});
app.use(serveStatic({ root: "static" }));
mod.mount(app);

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
  fetch: app.fetch,
} satisfies Serve;
