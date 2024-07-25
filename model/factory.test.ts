import { describe, expect, it } from "bun:test";
import type { Action, Component, Field } from "mrdamian-plugin";

import { asArgs } from "~/model/arguments";
import { fillComponent } from "~/model/component";
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
            id: "0",
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
          component: fillComponent(new DummyComponent()),
          action: {
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
