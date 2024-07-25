import { describe, expect, it, mock } from "bun:test";

import type { Action, Environment } from "mrdamian-plugin";

import { type Arguments, asArgs } from "~/model/arguments";
import type { FilledComponent } from "~/model/component";
import {
  type Parameters,
  type SubmoduleAction,
  asParams,
} from "~/model/config";
import { Evaluator, evaluate } from "~/model/evaluator";
import type { NamedEventEmitter } from "~/model/events";

function dummyComponent(): FilledComponent<Action> {
  return {
    fetch: mock(),
    initialize: mock(),
    start: mock(),
    process: mock(),
    stop: mock(),
    finalize: mock(),
  };
}

describe("evaluate", () => {
  it("transforms parameter's expression into environment value", () => {
    const args: Arguments = asArgs({
      expression: "$ a < b",
      escaped_dollar: "$$a < b",
      spaced_dollar: " $a < b",
      string: "a < b",
      recursive: {
        string: "a < b",
        expression: "$ a < b",
      },
    });
    const envs: Environment = {
      a: 100,
      b: 200,
    };
    const expected: Parameters = asParams({
      expression: true,
      escaped_dollar: "$a < b",
      spaced_dollar: " $a < b",
      string: "a < b",
      recursive: {
        string: "a < b",
        expression: true,
      },
    });

    const actual = evaluate(args, envs);
    expect(actual).toMatchObject(expected);
  });
});

describe("Evaluator", () => {
  const keys = [
    "fetch",
    "initialize",
    "start",
    "process",
    "stop",
    "finalize",
  ] as const;
  type Keys = (typeof keys)[number];
  // `...keys` is needed for remove readonly modifier from keys.
  // maybe it.each should take args as `readonly` but current Bun.it doesn't support it.
  it.each([...keys])("propagates %s call", async (method: Keys) => {
    const component = dummyComponent();
    const action: Action & { args: Arguments } = {
      id: "0",
      type: "dummy",
      args: asArgs({}),
    };
    const target = new Evaluator(component, action, {} as NamedEventEmitter);

    await target[method]({});
    expect(component[method]).toBeCalled();
  });

  it("process if when is not passed", async () => {
    const component = dummyComponent();
    const action: Action & { args: Arguments } = {
      id: "0",
      type: "dummy",
      // when: ...,
      args: asArgs({}),
    };
    const target = new Evaluator(component, action, {} as NamedEventEmitter);

    await target.process({});

    expect(component.process).toBeCalled();
  });

  it("process if when is meeted", async () => {
    const component = dummyComponent();
    const action: Action & { args: Arguments } = {
      id: "0",
      type: "dummy",
      when: "true",
      args: asArgs({}),
    };
    const target = new Evaluator(component, action, {} as NamedEventEmitter);
    await target.process({});

    expect(component.process).toBeCalled();
  });

  it("skip process if when is not meeted", async () => {
    const component = dummyComponent();
    const action: Action & { args: Arguments } = {
      id: "0",
      type: "dummy",
      when: "false",
      args: asArgs({}),
    };
    const target = new Evaluator(component, action, {} as NamedEventEmitter);
    await target.process({});

    expect(component.process).not.toBeCalled();
  });

  it("inherit component for submodule processing", async () => {
    const component = dummyComponent();
    const action: SubmoduleAction & { args: Arguments } = {
      id: "0",
      type: "submodule",
      path: "dummy.json5",
      inherit: {
        main: "hoge",
      },
      module: {
        inherit: {
          main: "dummy",
        },
        params: asParams({}),
        pipeline: [],
      },
      args: asArgs({}),
    };
    const target = new Evaluator(component, action, {} as NamedEventEmitter);

    await target.process({
      dummy: {
        hoge: {
          foo: 1,
          bar: 2,
          buz: 3,
        },
      },
    });

    expect(component.process).toBeCalledWith(
      {
        ...action,
        args: {
          dummy: {
            main: {
              foo: 1,
              bar: 2,
              buz: 3,
            },
          },
        },
      },
      {} as NamedEventEmitter,
    );
  });
});
