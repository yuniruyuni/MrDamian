import { setTimeout } from 'timers/promises';

import { loadModuleConfig } from "./model/config";
import { type ComponentConstructors, ModuleFactory } from "./model/module";
import { Timeout, eventChannel } from "./model/events";

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
  const factory = new ModuleFactory(constructors);
  const config = await loadModuleConfig("./config/main.json5");
  const mod = factory.constructModule(config);

  const [sender, receiver] = eventChannel();

  sender.send({
    event: {
      type: "string",
      value: "system/initialize",
    },
  });

  for( ; ; ) {
    const event = await receiver.receive();
    await mod.run(event, sender);
  }
}

run();