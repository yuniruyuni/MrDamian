import path from "node:path";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";

import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";

import open from "open";

import type { PluginInfo } from "~/model/plugin";

import { load } from "~/backend/load_config";
import { eventChannel } from "~/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/model/factory";

import { Datetime } from "~/component/datetime";
import { DeepL } from "~/component/deepl";
import { Logger } from "~/component/logger";
import { Panel } from "~/component/panel";
import { Periodic } from "~/component/periodic";
import { Translate } from "~/component/translate";
import { Twitch } from "~/component/twitch";
import { Youtube } from "~/component/youtube";

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

const app = new Elysia()
  .get("/api/module", async () => {
    return params;
  })
  .post("/api/module/run", async () => {
    run();
    return { status: "ok" };
  })
  .get("/api/plugin", async () => {
    const packages = await search("mrdamian-plugin");
    return packages.map(
      (pkg) =>
        ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          installed: false,
        }) as PluginInfo,
    );
  })
  .post("/api/plugin", async ({ body }) => {
    const params = JSON.parse(body as string) as { name: string };
    const name = params.name;

    const manager = new PluginManager({
      pluginsPath: path.join(process.cwd(), ".plugins"),
    });
    await manager.installFromNpm(name);

    return { status: "ok" };
  })
  .use(staticPlugin({ prefix: "/", assets: "static" }));

mod.mount(app);
open("http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
