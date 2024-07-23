import { describe, expect, it } from "bun:test";
import { Component, type ComponentConfig, type Field } from "mrdamian-plugin";

import { asArgs } from "~/model/arguments";
import { asParams } from "~/model/config";
import { ModuleFactory } from "~/model/factory";
import { EmitterStack, eventChannel } from "./events";

type DummyConfig = ComponentConfig;
class DummyComponent extends Component<DummyConfig> {
  dummy = "dummy";
  async process(): Promise<Field> {
    return undefined;
  }
}

describe("Factory", () => {
  it("can construct module", async () => {
    const gens = { dummy: DummyComponent };
    const [emitter, _absorber] = eventChannel();
    const stack = new EmitterStack([emitter]);
    const factory = new ModuleFactory(gens, stack);

    const mod = factory.construct({
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
    });

    expect(mod).toMatchObject({
      absorber: {}, // just check existence.
      config: {
        params: {},
        pipeline: [
          {
            args: {
              hoge: "fuga",
            },
            name: "name",
            type: "dummy",
            when: "true && false",
          },
        ],
      },
      pipeline: [
        {
          component: {
            dummy: "dummy",
          },
          config: {
            type: "dummy",
            name: "name",
            when: "true && false",
            args: asArgs({
              hoge: "fuga",
            }),
          },
        },
      ],
    });
  });
});
