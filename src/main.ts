import { eventChannel } from "./model/events";
import { type ComponentConstructors, ModuleFactory } from "./model/factory";
import { load } from "./model/parameters";

import { Datetime } from "./component/datetime";
import { DeepL } from "./component/deepl";
import { Logger } from "./component/logger";
import { Panel } from "./component/panel";
import { Periodic } from "./component/periodic";
import { Translate } from "./component/translate";
import { Twitch } from "./component/twitch";
import { Youtube } from "./component/youtube";

const constructors: ComponentConstructors = {
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

  const factory = new ModuleFactory(constructors, emitter);
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

run();
