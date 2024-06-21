import path from "node:path";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";

import open from "open";

import type { PluginInfo } from "~/model/plugin";

import { load } from "~/backend/load_config";
import { eventChannel } from "~/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/model/factory";

import { Datetime } from "~/backend/component/datetime";
import { DeepL } from "~/backend/component/deepl";
import { Logger } from "~/backend/component/logger";
import { Panel } from "~/backend/component/panel";
import { Periodic } from "~/backend/component/periodic";
import { Translate } from "~/backend/component/translate";
import { Twitch } from "~/backend/component/twitch";
import { Youtube } from "~/backend/component/youtube";

const gens: ComponentGenerators = {
  twitch: Twitch,
  youtube: Youtube,
  deepl: DeepL,

  periodic: Periodic,
  datetime: Datetime,
  logger: Logger,
  panel: Panel,
  translate: Translate,
};

const [emitter, absorber] = eventChannel();
const factory = new ModuleFactory(gens, emitter);
const params = await load("./config/main.json5");

async function run() {
  const mod = factory.constructModule(params);

  await mod.init({});

  emitter.emit({
    system: {
      initialied: true,
    },
  });

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
  c.json({ status: "ok" });
});

app.get("/api/plugin", async (c) => {
  const packages = await search("mrdamian-plugin");
  return c.json(
    packages.map(
      (pkg) =>
        ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          installed: false,
        }) as PluginInfo,
    ),
  );
});

app.post("/api/plugin", async (c) => {
  const params = (await c.req.json()) as { name: string };
  const name = params.name;

  const manager = new PluginManager({
    pluginsPath: path.join(process.cwd(), ".plugins"),
  });
  await manager.installFromNpm(name);

  return c.json({ status: "ok" });
});

app.use("/*", serveStatic({ root: "./static" }));

open("http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
