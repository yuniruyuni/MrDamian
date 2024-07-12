import { describe, expect, it, mock } from "bun:test";

import { Component } from "mrdamian-plugin";
import type {
  ComponentConfig,
  Environment,
  Fetch,
  Field,
} from "mrdamian-plugin";

import { type Arguments, asArgs } from "~/model/arguments";
import {
  type Parameters,
  type SubmoduleConfig,
  asParams,
} from "~/model/config";
import { Evaluator, evaluate } from "~/model/evaluator";

class DummyComponent extends Component<ComponentConfig> {
  mocks: {
    emitter: { emit: () => void },
    fetch: ()=> Fetch | undefined,
    initialize: (config: ComponentConfig) => Promise<Field>,
    start: (config: ComponentConfig) => Promise<Field>,
    process: (config: ComponentConfig) => Promise<Field>,
    stop: (config: ComponentConfig) => Promise<Field>,
    finalize: (config: ComponentConfig) => Promise<Field>,
  };
  constructor() {
    const emitter = {
      emit: mock(),
    };
    super(emitter);
    this.mocks = {
      emitter,
      fetch: mock(),
      initialize: mock(),
      start: mock(),
      process: mock(),
      stop: mock(),
      finalize: mock(),
    };
  }

  async fetch(): Promise<Fetch | undefined> {
    return this.mocks.fetch();
  }

  async initialize(config: ComponentConfig): Promise<void> {
    this.mocks.initialize(config);
  }

  async start(config: ComponentConfig): Promise<void> {
    this.mocks.start(config);
  }

  async process(config: ComponentConfig): Promise<Field> {
    return this.mocks.process(config);
  }

  async stop(config: ComponentConfig): Promise<void> {
    this.mocks.stop(config);
  }

  async finalize(config: ComponentConfig): Promise<void> {
    this.mocks.finalize(config);
  }
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
  const keys = ["fetch", "initialize", "start", "process", "stop", "finalize"] as const;
  type Keys = (typeof keys)[number];
  // `...keys` is needed for remove readonly modifier from keys.
  // maybe it.each should take args as `readonly` but current Bun.it doesn't support it.
  it.each([...keys])("propagates %s call", async (method: Keys) => {
    const component = new DummyComponent();
    const config: ComponentConfig & { args: Arguments } = {
      type: "dummy",
      args: asArgs({}),
    };
    const target = new Evaluator(component, config);

    await target[method]({});
    expect(component.mocks[method]).toBeCalled();
  });

  it("process if when is not passed", async () => {
    const component = new DummyComponent();
    const config: ComponentConfig & { args: Arguments } = {
      type: "dummy",
      // when: ...,
      args: asArgs({}),
    };
    const target = new Evaluator(component, config);

    await target.process({});

    expect(component.mocks.process).toBeCalled();
  });

  it("process if when is meeted", async () => {
    const component = new DummyComponent();
    const config: ComponentConfig & { args: Arguments } = {
      type: "dummy",
      when: "true",
      args: asArgs({}),
    };
    const target = new Evaluator(component, config);

    await target.process({});

    expect(component.mocks.process).toBeCalled();
  });

  it("skip process if when is not meeted", async () => {
    const component = new DummyComponent();
    const config: ComponentConfig & { args: Arguments } = {
      type: "dummy",
      when: "false",
      args: asArgs({}),
    };
    const target = new Evaluator(component, config);

    await target.process({});

    expect(component.mocks.process).not.toBeCalled();
  });

  it("inherit component for submodule processing", async () => {
    const component = new DummyComponent();
    const config: SubmoduleConfig & { args: Arguments } = {
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
    const target = new Evaluator(component, config);

    await target.process({
      dummy: {
        hoge: {
          foo: 1,
          bar: 2,
          buz: 3,
        },
      },
    });

    expect(component.mocks.process).toBeCalledWith({
      ...config,
      args: {
        dummy: {
          main: {
            foo: 1,
            bar: 2,
            buz: 3,
          },
        },
      },
    });
  });
});
