import { describe, expect, it } from "bun:test";

import {
  KeyNotExistError,
  NamedEventEmitter,
  eventChannel,
} from "~/model/events";

describe("NamedEventEmitter", () => {
  it("emit with keys", async () => {
    const [emitter, absorber] = eventChannel();
    const named = new NamedEventEmitter(emitter, ["dummy", "name"]);
    named.emit("abc");

    expect(await absorber.absorb()).toEqual({
      dummy: {
        name: "abc",
      },
    });
  });

  it("single key", async () => {
    const [emitter, absorber] = eventChannel();
    const named = new NamedEventEmitter(emitter, ["dummy"]);
    named.emit("abc");

    expect(await absorber.absorb()).toEqual({
      dummy: "abc",
    });
  });

  it("should be omit zero key construction", async () => {
    const [emitter] = eventChannel();
    expect(() => new NamedEventEmitter(emitter, [])).toThrowError(
      KeyNotExistError,
    );
  });
});
