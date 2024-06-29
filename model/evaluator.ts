import deepmerge from "deepmerge";

import { type ComponentConfig, isSubmoduleConfig } from "./config";
import type { Submodule } from "./factory";
import {
  type Environment,
  asArgs,
  evaluate,
  evaluateExpression,
} from "./variable";

import type { Fetch } from "./server";

import type { Component } from "./component";

export class Evaluator<C extends ComponentConfig> {
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

  async initialize(env: Environment): Promise<void> {
    return this.component.initialize(this.evaluate(env));
  }

  async receive(): Promise<void> {
    if (!isSubmoduleConfig(this.config)) return;

    const submodule = this.component as unknown as Submodule;
    submodule.receive();
  }

  async process(env: Environment): Promise<Environment> {
    // skip if when condition is not met.
    if (this.config.when) {
      const res = evaluateExpression(this.config.when, env);
      if (!res) {
        return env;
      }
    }

    const ret = await this.component.process(this.evaluate(env));

    const keys: string[] = [this.config.type, this.config.name].filter(
      (v): v is string => v !== undefined,
    );
    let obj = ret;
    for (const key of keys.reverse()) {
      obj = { [key]: obj };
    }
    return deepmerge(env, obj as Environment);
  }

  async finalize(env: Environment): Promise<void> {
    return this.component.finalize(this.evaluate(env));
  }
}