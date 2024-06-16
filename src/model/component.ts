import { type ComponentConfig } from './parameters';

import { Field, Environment, evaluate, evaluateExpression } from './variable';
import { EventEmitter } from './events';

export class ComponentWithConfig<C extends ComponentConfig> {
  readonly component: Component<C>;
  readonly config: C;

  constructor(component: Component<C>, config: ComponentConfig) {
    this.component = component;
    // TODO: implement some validator.
    this.config = config as C;
  }

  evaluate(env: Environment): C {
    // TODO: validate args
    const args = evaluate(this.config.args, env);
    return { ...this.config, args: args };
  }

  async init(env: Environment): Promise<Field> {
    return this.component.init(this.evaluate(env));
  }

  async run(env: Environment): Promise<Field> {
    // skip if when condition is not met.
    if (this.config.when) {
      const res = evaluateExpression(this.config.when, env);
      if (!res) {
        return undefined;
      }
    }
    return this.component.run(this.evaluate(env));
  }
}

export abstract class Component<C extends ComponentConfig> {
  private readonly emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  emit(event: Environment) {
    this.emitter.emit(event);
  }

  async init(_config: C): Promise<Field> {
    return undefined;
  }
  abstract run(config: C): Promise<Field>;
}
