import deepmerge from "deepmerge";

import type { Component } from "./component";
import { type ComponentConfig, type SubmoduleConfig, isSubmoduleConfig } from "./config";
import type { Fetch } from "./server";
import type { Submodule } from "./submodule";
import {
  type Environment,
  asArgs,
  evaluate,
  evaluateExpression,
} from "./variable";

export class Evaluator<C extends ComponentConfig> {
  readonly component: Component<C>;
  readonly config: C;

  constructor(component: Component<C>, config: ComponentConfig) {
    this.component = component;
    // TODO: implement some validator.
    this.config = config as C;
    this.config.height ||= this.component.height();
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
    return submodule.receive();
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

  private evaluate(env: Environment): C {
    // TODO: validate args
    const args = evaluate(this.config.args ?? asArgs({}), env);
    const inherited = this.inherit(env);

    return { ...this.config, args: deepmerge(args, inherited) };
  }

  private inherit(env: Environment): Environment {
    if (!isSubmoduleConfig(this.config)) return {};
    if (!this.config.module.inherit) return {};

    const config: SubmoduleConfig = this.config;
    return Object.entries(config.module.inherit).reduce((inherited, [name, type]) =>{
      const iname = config.inherit[name];
      const keys = [type, iname].filter((v): v is string => v !== undefined);
      return deepmerge(inherited, {
        [type]: {
          [name]: this.dig(env, ...keys),
        },
      });
    }, {});
  }

  private dig(env: Environment, ...keys: string[]): Environment | undefined{
    let cursor: Environment = env;
    for( const key of keys) {
      const field = cursor[key];
      if (!field) return undefined;
      if (typeof field !== "object") return undefined;
      if (Array.isArray(field)) return undefined;
      cursor = field;
    }
    return cursor;
  }
}