import deepmerge from "deepmerge";
import { EvalAstFactory, parse } from "jexpr";
import type {
  Component,
  ComponentConfig,
  Environment,
  Fetch,
} from "mrdamian-plugin";

import { type Arguments, asArgs } from "~/model/arguments";
import { type SubmoduleConfig, isSubmoduleConfig } from "~/model/config";
import type { Submodule } from "~/model/submodule";

export class Evaluator<C extends ComponentConfig = ComponentConfig> {
  readonly component: Component<C>;
  readonly config: C & { args: Arguments };

  constructor(
    component: Component<C>,
    config: ComponentConfig & { args: Arguments },
  ) {
    this.component = component;
    // TODO: implement some validator.
    this.config = config as C & { args: Arguments };
  }

  async fetch(): Promise<Fetch | undefined> {
    return this.component.fetch();
  }

  async initialize(env: Environment): Promise<void> {
    return this.component.initialize(this.evaluate(env));
  }

  async start(env: Environment): Promise<void> {
    return this.component.start(this.evaluate(env));
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

  async stop(env: Environment): Promise<void> {
    return this.component.stop(this.evaluate(env));
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
    return Object.entries(config.module.inherit).reduce(
      (inherited, [name, type]) => {
        const iname = config.inherit[name];
        const keys = [type, iname].filter((v): v is string => v !== undefined);
        return deepmerge(inherited, {
          [type]: {
            [name]: this.dig(env, ...keys),
          },
        });
      },
      {},
    );
  }

  private dig(env: Environment, ...keys: string[]): Environment | undefined {
    let cursor: Environment = env;
    for (const key of keys) {
      const field = cursor[key];
      if (!field) return undefined;
      if (typeof field !== "object") return undefined;
      if (Array.isArray(field)) return undefined;
      cursor = field;
    }
    return cursor;
  }
}

export function evaluateExpression(code: string, envs: Environment) {
  const astFactory = new EvalAstFactory();
  const expr = parse(code, astFactory);
  // TODO: follow up the evaluate result was invalid case.
  return expr?.evaluate(envs);
}

// evaluate function takes two arguments, target and envs.
// target is the Parameters type that contains the expression string that starts with "$".
// envs is the Environment type that contains the evaluated result of the Parameters type.
// evaluate function returns the Environment type that contains the evaluated result of the target.
export function evaluate(args: Arguments, envs: Environment): Environment {
  return Object.fromEntries(
    Object.entries(args ?? {}).map(([key, val]) => {
      if (typeof val === "object" && Array.isArray(val))
        return [key, val.map((v) => evaluate(v as Arguments, envs))];
      if (typeof val === "object")
        return [key, evaluate(val as Arguments, envs)];
      if (typeof val !== "string") return [key, val];

      // check if it's an expression.
      if (val.length < 2) return [key, val];
      if (val[0] !== "$") return [key, val];
      if (val[0] === "$" && val[1] === "$") {
        return [key, val.slice(1)];
      }

      const code = val.slice(1);
      const res = evaluateExpression(code, envs);
      return [key, res];
    }),
  );
}
