import { describe, expect, it } from "bun:test";
import type { SubmoduleConfig } from "./config";
import { NamedEventEmitter, eventChannel } from "./events";
import type { ComponentGenerators } from "./factory";
import { Submodule } from "./submodule";
import { asArgs, asParams } from "./variable";

describe("Submodule", () => {
  it("can emit message", async () => {
    const config: SubmoduleConfig = {
      type: "submodule",
      path: "./dummy.json5", // actually this file is not found, but in this test it doesn't used so ok.
      module: {
        params: asParams({}),
        pipeline: [
          {
            type: "dummy",
            name: "name",
            when: "true && false",
            args: asArgs({
              hoge: "fuga",
            }),
            height: 100,
          },
        ],
      },
    };
    const [emitter, absorber] = eventChannel();
    const named: NamedEventEmitter = new NamedEventEmitter(emitter, ["key"]);
    const gens: ComponentGenerators = {};
    const submodule = new Submodule(config, named, gens);

    submodule.emit("abc");

    expect(await absorber.absorb()).toMatchObject({
      key: "abc",
    });
  });
});