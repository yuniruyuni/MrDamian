import type { EventEmitter } from "./events";
import type { ModuleConfig } from "./parameters";
import type { Pipeline } from "./pipeline";
import type { Server } from "./server";
import type { Environment, Parameters } from "./variable";

export class Module {
  emitter: EventEmitter;
  config: ModuleConfig;
  pipeline: Pipeline;

  constructor(config: ModuleConfig, pipeline: Pipeline, emitter: EventEmitter) {
    this.config = config;
    this.pipeline = pipeline;
    this.emitter = emitter;
  }

  async init(init: Environment): Promise<void> {
    await Promise.all(this.pipeline.map(async (comp) => comp.init(init)));
  }

  emit(event: Environment): void {
    this.emitter.emit(event);
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
