import { Hono } from "hono";
import open from 'open';

import { eventChannel } from "~/backend/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/backend/model/factory";
import { load } from "~/backend/model/parameters";

import { Datetime } from "~/backend/component/datetime";
import { DeepL } from "~/backend/component/deepl";
import { Logger } from "~/backend/component/logger";
import { Panel } from "~/backend/component/panel";
import { Periodic } from "~/backend/component/periodic";
import { Translate } from "~/backend/component/translate";
import { Twitch } from "~/backend/component/twitch";
import { Youtube } from "~/backend/component/youtube";

// @ts-ignore: refer https://github.com/oven-sh/bun/issues/9276
import html from "~/static/index.html" with { type: "text" };
// @ts-ignore: refer https://github.com/oven-sh/bun/issues/9276
import js from "~/static/index.js" with { type: "text" };

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

async function run() {
  const [emitter, absorber] = eventChannel();

  const factory = new ModuleFactory(gens, emitter);
  const params = await load("./config/main.json5");
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
app.get("/", (c) => c.html(html));
app.get("/main.js", (c) =>
  c.body(js, 200, { "Content-Type": "text/javascript" }),
);

run();
open("http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
