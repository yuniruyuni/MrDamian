import deepmerge from "deepmerge";
import { EvalAstFactory, parse } from "jexpr";
import type { Action, Environment, Fetch } from "mrdamian-plugin";

import { type Arguments, asArgs } from "~/model/arguments";
import type { FilledComponent } from "~/model/component";
import { type SubmoduleAction, isSubmoduleAction } from "~/model/config";
import type { NamedEventEmitter } from "~/model/events";
import type { Submodule } from "~/model/submodule";

export class Evaluator<A extends Action = Action> {
  readonly component: FilledComponent<A>;
  readonly action: A & { args: Arguments };
  readonly emitter: NamedEventEmitter;

  constructor(
    component: FilledComponent<A>,
    action: Action & { args: Arguments },
    emitter: NamedEventEmitter,
  ) {
    this.component = component;
    // TODO: implement some validator.
    this.action = action as A & { args: Arguments };
    this.emitter = emitter;
  }

  async fetch(): Promise<Fetch> {
    return this.component.fetch();
  }

  async initialize(env: Environment): Promise<void> {
    return this.component.initialize(this.evaluate(env), this.emitter);
  }

  async start(env: Environment): Promise<void> {
    return this.component.start(this.evaluate(env), this.emitter);
  }

  async receive(): Promise<void> {
    if (!isSubmoduleAction(this.action)) return;

    const submodule = this.component as unknown as Submodule;
    return submodule.receive();
  }

  async process(env: Environment): Promise<Environment> {
    // skip if when condition is not met.
    if (this.action.when) {
      const res = evaluateExpression(this.action.when, env);
      if (!res) {
        return env;
      }
    }

    const ret = await this.component.process(this.evaluate(env), this.emitter);

    const keys: string[] = [this.action.type, this.action.name].filter(
      (v): v is string => v !== undefined,
    );
    let obj = ret;
    for (const key of keys.reverse()) {
      obj = { [key]: obj };
    }
    return deepmerge(env, obj as Environment);
  }

  async stop(env: Environment): Promise<void> {
    return this.component.stop(this.evaluate(env), this.emitter);
  }

  async finalize(env: Environment): Promise<void> {
    return this.component.finalize(this.evaluate(env), this.emitter);
  }

  private evaluate(env: Environment): A {
    // TODO: validate args
    const args = evaluate(this.action.args ?? asArgs({}), env);
    const inherited = this.inherit(env);

    return { ...this.action, args: deepmerge(args, inherited) };
  }

  private inherit(env: Environment): Environment {
    if (!isSubmoduleAction(this.action)) return {};
    if (!this.action.module.inherit) return {};

    const action: SubmoduleAction = this.action;
    return Object.entries(action.module.inherit).reduce(
      (inherited, [name, type]) => {
        const iname = action.inherit[name];
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
