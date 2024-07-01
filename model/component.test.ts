import { describe, expect, it } from "bun:test";
import { Component } from "./component";
import type { ComponentConfig } from "./component";
import type { Field } from "./environment";
import { NamedEventEmitter, eventChannel } from "./events";

type DummyConfig = ComponentConfig;

class Dummy extends Component<DummyConfig> {
  async process(_config: DummyConfig): Promise<Field> {
    return "dummy-process";
  }
}

describe("Component", () => {
  it("can emit event", async () => {
    const [emitter, absorber] = eventChannel();
    const named = new NamedEventEmitter(emitter, ["dummy", "name"]);
    const dummy = new Dummy(named);
    dummy.emit("abc");

    expect(await absorber.absorb()).toEqual({
      dummy: {
        name: "abc",
      },
    });
  });
});