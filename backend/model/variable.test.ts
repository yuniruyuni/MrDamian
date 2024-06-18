import { describe, expect, it } from "bun:test";
import {
  type Arguments,
  type Environment,
  type Parameters,
  asArgs,
  asParams,
  evaluate,
} from "./variable";

describe("Parameters", () => {
  it("can contains basic types", () => {
    const params: Parameters = asParams({
      string: "test",
      expression: "$ a < b",
      boolean: true,
      number: 1,
      array: [],
      object: {},
    });
    expect(params).toMatchObject({
      string: "test",
      expression: "$ a < b",
      boolean: true,
      number: 1,
      array: [],
      object: {},
    });
  });
});

describe("Arguments", () => {
  it("can contains basic types", () => {
    const args: Arguments = asArgs({
      string: "test",
      // "expression": "$ a < b", // Environment is already evaluated so expression type is not exists.
      boolean: true,
      number: 1,
      array: [],
      object: {},
    });

    expect(args).toMatchObject({
      string: "test",
      // expression: "$ a < b",
      boolean: true,
      number: 1,
      array: [],
      object: {},
    });
  });
});

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
