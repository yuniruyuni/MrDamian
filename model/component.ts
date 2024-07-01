import type { Arguments, Field } from "./environment";

export interface EventEmitter {
  emit(event: Field): void;
}

export type Fetch = (request: Request) => Response | Promise<Response>;

export type ComponentConfig = {
  // "type" field is a component type.
  type: string;
  // "name" field is a unique identifier for component instance.
  // this name will be used for assigning result to environment.
  // for example, if a component specified type = "twitch", name = "main",
  // the result value of the component will be assigned to "twitch.main".
  // it means, { "twitch": { "main": ... } } will be merged into current environment.
  name?: string;
  // "when" field is an expression for conditional execution.
  // this expression don't need define with "$" prefix.
  when?: string;
  // "args" field is a list of arguments for component.
  args?: Arguments;
};

export abstract class Component<C extends ComponentConfig> {
  private readonly emitter: EventEmitter;
  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  emit(event: Field) {
    this.emitter.emit(event);
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
