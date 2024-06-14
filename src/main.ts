import { loadModuleParameters } from "./model/parameters";
import { type ComponentConstructors, ModuleFactory } from "./model/module";
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
  const params = await loadModuleParameters("./config/main.json5");
  const mod = factory.constructModule(params);

  sender.send({
    event:  "system/initialize",
  });

  for( ; ; ) {
    const event = await receiver.receive();
    await mod.run(event);
  }
}

run();
