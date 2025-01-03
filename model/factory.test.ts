import { describe, expect, it } from "bun:test";
import type { Action, Component, Field } from "mrdamian-plugin";

import { asArgs } from "~/model/arguments";
import { asParams } from "~/model/config";
import { EmitterStack } from "~/model/events";
import { ModuleFactory } from "~/model/factory";

type DummyConfig = Action;
class DummyComponent implements Component<DummyConfig> {
  async process(): Promise<Field> {
    return undefined;
  }
}

describe("Factory", () => {
  it("can construct module", async () => {
    const gens = { DummyComponent };
    const [stack] = new EmitterStack().spawn();
    const factory = new ModuleFactory(gens, stack);

    const mod = factory.construct({
      params: asParams({}),
      inherit: {},
      pipeline: [
        {
          id: "0",
          type: "dummy",
          action: "",
          name: "name",
          when: "true && false",
          args: asArgs({
            hoge: "fuga",
          }),
        },
      ],
    });

    expect(mod).toMatchObject({
      absorber: {
        channel: {
          queue: {
            aborted: false,
            data: expect.any(Array),
            waiting: expect.any(Array),
          },
        },
      },
      config: {
        inherit: {},
        params: {},
        pipeline: [
          {
            action: "",
            args: {
              hoge: "fuga",
            },
            id: "0",
            name: "name",
            type: "dummy",
            when: "true && false",
          },
        ],
      },
      pipeline: [
        expect.objectContaining({
          action: expect.any(Object),
          component: expect.any(Object),
          emitter: expect.any(Object),
        }),
      ],
    });
  });
});
