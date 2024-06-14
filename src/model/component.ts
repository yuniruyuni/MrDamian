import {
  type ComponentConfig,
} from './config';

import { Environment } from './variable';
import { EventSender } from './events';

export abstract class Component<T extends ComponentConfig> {
  readonly config: T;
  readonly sender: EventSender;

  constructor(config: T, sender: EventSender) {
    this.config = config;
    this.sender = sender;
  }

  send(event: Environment) {
    this.sender.send(event);
  }

  runRaw(args: Environment): Environment {
    // TODO: Validate args
    return this.run(args as T);
  }

  abstract run(args: T): Environment;
}