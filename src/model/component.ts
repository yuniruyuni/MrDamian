import { type ComponentConfig } from './parameters';

import { Field, Environment, evaluate } from './variable';
import { EventSender } from './events';

export abstract class Component<C extends ComponentConfig> {
  readonly config: C;
  readonly sender: EventSender;

  constructor(config: ComponentConfig, sender: EventSender) {
    // TODO: implement some validator.
    this.config = config as C;
    this.sender = sender;
  }

  send(event: Environment) {
    this.sender.send(event);
  }

  async initRaw(env: Environment): Promise<Field> {
    // TODO: validate args
    const args = evaluate(this.config.args, env);
    return this.init(args);
  }

  async runRaw(env: Environment): Promise<Field> {
    // TODO: validate args
    const args = evaluate(this.config.args, env);
    return this.run(args);
  }

  async init(_args: C["args"]): Promise<Field> { return undefined; }
  abstract run(args: C["args"]): Promise<Field>;
}
