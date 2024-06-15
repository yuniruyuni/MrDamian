import { type ComponentParameters } from './parameters';

import { Environment, evaluate } from './variable';
import { EventSender } from './events';

export abstract class Component<T extends ComponentParameters> {
  readonly params: T;
  readonly sender: EventSender;

  constructor(params: T, sender: EventSender) {
    this.params = params;
    this.sender = sender;
  }

  send(event: Environment) {
    this.sender.send(event);
  }

  runRaw(env: Environment): Environment {
    // TODO: Validate args
    const args = {
      ...env,
      ...evaluate(this.params, env),
    };
    return this.run(args as T);
  }

  abstract run(args: T): Environment;
}
