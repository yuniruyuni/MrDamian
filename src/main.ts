import { load } from "./model/parameters";
import { type ComponentConstructors, ModuleFactory } from "./model/factory";
import { eventChannel } from "./model/events";

import { Twitch } from './component/twitch';
import { Youtube } from './component/youtube';
import { Logger } from './component/logger';
import { Panel } from './component/panel';
import { Translate } from './component/translate';

const constructors: ComponentConstructors = {
  twitch: Twitch,
  youtube: Youtube,

  logger: Logger,
  panel: Panel,
  translate: Translate,
};

async function run() {
  const [sender, receiver] = eventChannel();

  const factory = new ModuleFactory(constructors, sender);
  const params = await load("./config/main.json5");
  const mod = factory.constructModule(params);

  await mod.init({});

  sender.send({
    event:  "system/initialize",
  });

  for await (const event of receiver) {
    await mod.run(event);
  }
}

run();
