import { describe, expect, it } from "bun:test";
import { type Parameters, asParams } from "~/model/config";

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
