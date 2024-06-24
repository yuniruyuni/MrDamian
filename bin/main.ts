import path from "node:path";
import type { Serve } from "bun";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";
import open from "open";

import type { PluginInfo } from "~/model/plugin";

import { load } from "~/backend/load_config";
import { eventChannel } from "~/model/events";
import {
  type ComponentGenerator,
  type ComponentGenerators,
  ModuleFactory,
} from "~/model/factory";

import { Datetime } from "~/component/datetime";
import { DeepL } from "~/component/deepl";
import { Logger } from "~/component/logger";
import { Periodic } from "~/component/periodic";
import { Translate } from "~/component/translate";
import { Twitch } from "~/component/twitch";
import { Youtube } from "~/component/youtube";

const manager = new PluginManager({
  pluginsPath: path.join(process.cwd(), ".plugins"),
});

const installed: ComponentGenerators = Object.fromEntries(
  manager
    .list()
    .flatMap((pkg) => {
      const pattern = /^mrdamian-plugin-(.*)$/;
      const found = pkg.name.match(pattern);
      if (!found) return [];
      const type = found[1] as string;
      const required = manager.require(`${pkg.name}/dist/index.js`);
      return [[type, required as ComponentGenerator]];
    }),
);

const gens: ComponentGenerators = {
  ...installed,
  twitch: Twitch,
  youtube: Youtube,
  deepl: DeepL,

  periodic: Periodic,
  datetime: Datetime,
  logger: Logger,
  translate: Translate,
};

const [emitter, absorber] = eventChannel();
const factory = new ModuleFactory(gens, emitter);
const params = await load("./config/main.json5");
const mod = factory.constructModule(params);

async function run() {
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
          installed: !!manager.list().find((p) => p.name === pkg.name),
        }) as PluginInfo,
    ),
  );
});
app.post("/api/plugin", async (c) => {
  const params = (await c.req.json()) as { name: string };
  const name = params.name;
  await manager.installFromNpm(name);

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
