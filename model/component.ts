import deepmerge from "deepmerge";

import type { NamedEventEmitter } from "./events";
import type { ComponentConfig } from "./parameters";
import {
  type Environment,
  type Field,
  asArgs,
  evaluate,
  evaluateExpression,
} from "./variable";

import type { Fetch } from "./server";

export class ComponentWithConfig<C extends ComponentConfig> {
  readonly component: Component<C>;
  readonly config: C;

  constructor(component: Component<C>, config: ComponentConfig) {
    this.component = component;
    // TODO: implement some validator.
    this.config = config as C;
    this.config.height ||= this.component.height();
  }

  evaluate(env: Environment): C {
    // TODO: validate args
    const args = evaluate(this.config.args ?? asArgs({}), env);
    return { ...this.config, args: args };
  }

  get fetch(): Fetch {
    return this.component.fetch;
  }

  async init(env: Environment): Promise<void> {
    return this.component.init(this.evaluate(env));
  }

  async run(env: Environment): Promise<Environment> {
    // skip if when condition is not met.
    if (this.config.when) {
      const res = evaluateExpression(this.config.when, env);
      if (!res) {
        return env;
      }
    }

    const ret = await this.component.run(this.evaluate(env));

    const keys: string[] = [this.config.type, this.config.name].filter(
      (v): v is string => v !== undefined,
    );
    let obj = ret;
    for (const key of keys.reverse()) {
      obj = { [key]: obj };
    }
    return deepmerge(env, obj as Environment);
  }
}

export abstract class Component<C extends ComponentConfig> {
  private readonly emitter: NamedEventEmitter;
  constructor(emitter: NamedEventEmitter) {
    this.emitter = emitter;
  }

  emit(event: Field) {
    this.emitter.emit(event);
  }

  height(): number {
    return 50;
  }

  get fetch(): Fetch {
    return (_req: Request): Response | Promise<Response> => {
      return new Response("No configuration", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    };
  }

  async init(_config: C): Promise<void> {}
  abstract run(config: C): Promise<Field>;
}
