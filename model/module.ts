import type { ModuleConfig, Parameters } from "./config";
import type { Environment } from "./environment";
import type { EventAbsorber } from "./events";
import type { Pipeline } from "./pipeline";
import type { Server } from "./server";

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

  get aborted(): boolean {
    return this.absorber.aborted;
  }

  async initialize(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.initialize(init)));
  }

  async finalize(init: Environment): Promise<void> {
    this.absorber.abort();
    await Promise.all(this.pipeline.map(async (comp) => comp.finalize(init)));
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
        const event = await this.absorber.absorb();
        if (event === undefined) return;
        await this.reduce(event);
      })(),
    ]);
  }

  async reduce(init: Environment): Promise<Environment> {
    return await this.pipeline.reduce(async (penv, comp) => {
      const env: Environment = await penv;
      return await comp.process(env);
    }, Promise.resolve(init));
  }

  async process(init: Environment): Promise<Environment> {
    const params: Parameters = this.config.params ?? ({} as Parameters);
    // our component have default value as "params" in it's configuration file.
    const filled = { ...params, ...init };
    const filtered = Object.fromEntries(
      Object.entries(params).map(([key, _value]) => [key, filled[key]]),
    );
    return this.reduce(filtered);
  }
}
