import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import open from "open";

import { load } from "~/backend/load_config";
import { eventChannel } from "~/model/events";
import {
  type ComponentGenerators,
  ModuleFactory,
} from "~/model/factory";

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
app.use("/*", serveStatic({ root: "./static" }));

open("http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
