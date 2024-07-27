import type { Action, Component } from "mrdamian-plugin";

export type FilledComponent<A extends Action> = Required<Component<A>>;

export function fillComponent<A extends Action>(comp: Component<A>): FilledComponent<A> {
  comp.fetch = comp.fetch || (async () =>
      (_req: Request): Response | Promise<Response> => {
        return new Response("No operation screen", {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      });
  comp.initialize = comp.initialize || (async () => {});
  comp.start = comp.start || (async () => {});
  comp.process = comp.process || (async () => undefined);
  comp.stop = comp.stop || (async () => {});
  comp.finalize = comp.finalize || (async () => {});

  return comp as FilledComponent<A>;
}