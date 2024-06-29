import type { NamedEventEmitter } from "./events";
import type { ComponentConfig } from "./parameters";
import type { Fetch } from "./server";
import type { Field } from "./variable";

export abstract class Component<C extends ComponentConfig> {
  private readonly emitter: NamedEventEmitter;
  constructor(emitter: NamedEventEmitter) {
    this.emitter = emitter;
  }

  emit(event: Field) {
    this.emitter.emit(event);
  }

  height(): number {
    return 50;
  }

  async initialize(_config: C): Promise<void> {}
  abstract process(config: C): Promise<Field>;
  async finalize(_config: C): Promise<void> {}

  get fetch(): Fetch {
    return (_req: Request): Response | Promise<Response> => {
      return new Response("No configuration", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    };
  }
}
