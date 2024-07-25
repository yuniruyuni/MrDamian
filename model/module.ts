import type { Environment } from "mrdamian-plugin";

import type { ModuleConfig, Parameters } from "~/model/config";
import type { EventAbsorber } from "~/model/events";
import type { Instances } from "~/model/instances";
import type { Pipeline } from "~/model/pipeline";
import type { Server } from "~/model/server";

export class Module {
  absorber: EventAbsorber;
  config: ModuleConfig;
  pipeline: Pipeline;
  instances: Instances;

  constructor(
    config: ModuleConfig,
    pipeline: Pipeline,
    absorber: EventAbsorber,
    instances: Instances,
  ) {
    this.config = config;
    this.pipeline = pipeline;
    this.absorber = absorber;
    this.instances = instances;
  }

  get aborted(): boolean {
    return this.absorber.aborted;
  }

  async initialize(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.initialize(init)));
  }

  async start(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.start(init)));
  }

  async stop(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.stop(init)));
  }

  async finalize(init: Environment): Promise<void> {
    this.absorber.abort();
    await Promise.all(this.pipeline.map(async (comp) => comp.finalize(init)));
  }

  async mount<T extends Server<T>>(server: T): Promise<T> {
    for (const [key, instance] of this.instances.entries()) {
      const f = await instance.fetch();
      const path = `/${key}/`;
      server.mount(path, f);
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
