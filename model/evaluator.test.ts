import { describe, expect, it } from "bun:test";
import type { Environment } from "mrdamian-plugin";

import { type Arguments, asArgs } from "~/model/arguments";
import { type Parameters, asParams } from "~/model/config";
import { evaluate } from "~/model/evaluator";

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
