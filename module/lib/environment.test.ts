import { describe, expect, it } from "bun:test";
import type { Environment } from "./environment";

describe("Environment", () => {
  it("can contains basic types", () => {
    const args: Environment = {
      string: "test",
      boolean: true,
      number: 1,
      array: [],
      object: {},
      recursive: {
        string: "test",
        boolean: true,
        number: 1,
        array: [],
        object: {},
      },
    };

    expect(args).toMatchObject({
      string: "test",
      boolean: true,
      number: 1,
      array: [],
      object: {},
      recursive: {
        string: "test",
        boolean: true,
        number: 1,
        array: [],
        object: {},
      },
    });
  });
});
