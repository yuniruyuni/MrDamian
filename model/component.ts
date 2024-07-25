import type { Action, Component } from "mrdamian-plugin";

export type FilledComponent<C extends Action> = Required<Component<C>>;

export function fillComponent<C extends Action>(comp: Component<C>): FilledComponent<C> {
    return {
      fetch:
        async () =>
        (_req: Request): Response | Promise<Response> => {
          return new Response("No configuration", {
            status: 200,
            headers: { "Content-Type": "text/html" },
          });
        },
      initialize: async () => {},
      start: async () => {},
      process: async () => { return undefined; },
      stop: async () => {},
      finalize: async () => {},
      ...comp,
    };
}