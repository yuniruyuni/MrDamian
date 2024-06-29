import { describe, expect, it } from "bun:test";
import { Component } from "./component";
import type { ComponentConfig } from "./config";
import { ModuleFactory } from "./factory";
import { type Field, asArgs, asParams } from "./variable";


type DummyConfig = ComponentConfig;
class DummyComponent extends Component<DummyConfig> {
  dummy = "dummy";
  async process(): Promise<Field> {
    return undefined;
  }
}

describe("Factory", () => {
  it("can construct module", async () => {
    const gens = {dummy: DummyComponent};
    const factory = new ModuleFactory(gens);

    const mod = factory.construct({
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
            height: 100,
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
            height: 100,
          },
        },
      ],
    });
  });
});