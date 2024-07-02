import { describe, expect, it } from "bun:test";
import { type Arguments, asArgs } from "~/model/arguments";

describe("Arguments", () => {
  it("can contains basic types", () => {
    const args: Arguments = asArgs({
      string: "test",
      // "expression": "$ a < b", // Arguments is already evaluated so expression type is not exists.
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
