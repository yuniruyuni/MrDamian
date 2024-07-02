import { describe, expect, it } from "bun:test";

import { asArgs } from "~/model/arguments";
import { type SubmoduleConfig, asParams } from "~/model/config";
import { NamedEventEmitter, eventChannel } from "~/model/events";
import type { ComponentGenerators } from "~/model/factory";
import { Submodule } from "~/model/submodule";

describe("Submodule", () => {
  it("can emit message", async () => {
    const config: SubmoduleConfig = {
      type: "submodule",
      path: "./dummy.json5", // actually this file is not found, but in this test it doesn't used so ok.
      inherit: {},
      module: {
        params: asParams({}),
        inherit: {},
        pipeline: [
          {
            type: "dummy",
            name: "name",
            when: "true && false",
            args: asArgs({
              hoge: "fuga",
            }),
          },
        ],
      },
    };
    const [emitter, absorber] = eventChannel();
    const named: NamedEventEmitter = new NamedEventEmitter(emitter, ["key"]);
    const gens: ComponentGenerators = {};
    const submodule = new Submodule(config, named, gens, new Map());

    submodule.emit("abc");

    expect(await absorber.absorb()).toMatchObject({
      key: "abc",
    });
  });
});
