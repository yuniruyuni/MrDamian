import type { EventAbsorber } from "./events";
import type { ModuleConfig } from "./parameters";
import type { Pipeline } from "./pipeline";
import type { Server } from "./server";
import type { Environment, Parameters } from "./variable";

export class Module {
  absorber: EventAbsorber;
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(
    config: ModuleConfig,
    pipeline: Pipeline,
    absorber: EventAbsorber,
  ) {
    this.config = config;
    this.pipeline = pipeline;
    this.absorber = absorber;
  }

  async init(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.init(init)));
  }

  mount<T extends Server<T>>(server: T): T {
    for (const comp of this.pipeline) {
      const path = [comp.config.type, comp.config.name]
        .filter((v): v is string => v !== undefined)
        .join("/");
      server.mount(`/${path}/`, comp.fetch);
    }
    return server;
  }

  async receive(): Promise<void> {
    const awaits = this.pipeline.map(async (c) => c.receive());

    await Promise.all([
      ...awaits,
      (async () => {
        const event = this.absorber.absorb();
        await this.pipeline.reduce(async (penv, comp) => {
          const env: Environment = await penv;
          return await comp.run(env);
        }, Promise.resolve(event));
      })(),
    ]);
  }

  async run(init: Environment): Promise<Environment> {
    const params: Parameters = this.config.params ?? ({} as Parameters);
    // our component have default value as "params" in it's configuration file.
    const filled = { ...params, ...init };
    const filtered = this.config.main
      ? filled
      : Object.fromEntries(
          Object.entries(params).map(([key, _value]) => [key, filled[key]]),
        );

    return await this.pipeline.reduce(async (penv, comp) => {
      const env: Environment = await penv;
      return await comp.run(env);
    }, Promise.resolve(filtered));
  }
}
