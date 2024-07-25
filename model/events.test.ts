import { describe, expect, it } from "bun:test";

import {
  EmitterStack,
  KeyNotExistError,
  NamedEventEmitter,
} from "~/model/events";

describe("NamedEventEmitter", () => {
  it("emit with keys", async () => {
    const [stack, absorber] = (new EmitterStack()).spawn();
    const named = new NamedEventEmitter(stack, ["dummy", "name"]);
    named.emit("abc");

    expect(await absorber.absorb()).toEqual({
      dummy: {
        name: "abc",
      },
    });
  });

  it("single key", async () => {
    const [stack, absorber] = (new EmitterStack()).spawn();
    const named = new NamedEventEmitter(stack, ["dummy"]);
    named.emit("abc");

    expect(await absorber.absorb()).toEqual({
      dummy: "abc",
    });
  });

  it("should be omit zero key construction", async () => {
    const [stack] = (new EmitterStack()).spawn();
    expect(() => new NamedEventEmitter(stack, [])).toThrowError(
      KeyNotExistError,
    );
  });
});
