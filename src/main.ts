import { loadModuleConfig } from "./model/config";
import { type ComponentConstructors, ModuleFactory } from "./model/module";

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

  for( ; ; ) {
    await mod.run({});
  }
}

run();