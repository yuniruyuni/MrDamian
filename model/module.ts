import type { Environment, Fetch } from "mrdamian-plugin";

import type { ModuleConfig, Parameters } from "~/model/config";
import type { Evaluator } from "~/model/evaluator";
import type { EventAbsorber } from "~/model/events";
import type { Pipeline } from "~/model/pipeline";
import type { Server } from "~/model/server";

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

  defaultFetch(_req: Request): Response | Promise<Response> {
    return new Response("No configuration", {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  async mount<T extends Server<T>>(server: T): Promise<T> {
    // TODO: care about submodule-inheritance of components.

    // select all same key components.
    const m: Map<string, Evaluator[]> = new Map();

    for (const comp of this.pipeline) {
      const path = [comp.config.type, comp.config.name]
        .filter((v): v is string => v !== undefined)
        .join("/");
      m.get(path)?.push(comp) ?? m.set(`/${path}/`, [comp]);
    }

    for ( const [path, comps] of m.entries()) {
      const fetches: Fetch[] = (
        await Promise.all(comps.map((comp) => comp.fetch()))
      ).filter((f): f is Fetch => f !== undefined);

      if( fetches.length > 0 ) {
        // mount fetches related with such same type/name components.
        for ( const fetch of fetches ) {
          server.mount(path, fetch);
        }
      } else {
        // mount defaultFetch if no valid fetch for such type/name components.
        server.mount(path, (req: Request) => this.defaultFetch(req));
      }
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
