import path from "node:path";
import { AutoRouter, error, json } from "itty-router";
import type {
  Action,
  Component,
  Environment,
  EventEmitter,
  Fetch,
  Field,
} from "module/lib";
import type { Binding, Cell, Panel as PanelModel, Panels, Status } from "./model";

const sendFile = (rel: string) => {
  const f = Bun.file(path.join(import.meta.dir, rel));
  return new Response(f, { headers: { "Content-Type": f.type } });
};

export type InitAction = Action & {
  action: "";
};
export type DefineAction = Action & {
  action: "define";
  args: {
    name?: string;
    width: number;
    height: number;
    cells: Cell[];
  };
};

export type PanelAction = InitAction | DefineAction;

export default class Panel implements Component<PanelAction> {
  panels: Panels = {};

  async fetch(): Promise<Fetch> {
    const router = AutoRouter();

    return router
      .get("/", async () => sendFile("dist/index.html"))
      .get("/index.js", async () => sendFile("dist/index.js"))
      .get("/index.css", async () => sendFile("dist/index.css"))
      .get("/forms", async () => json(this.panels))
      .post("/forms", async (req: Request) => {
        const content = await req.json();
        const id = content.id;
        const name = content.name;

        const panel = this.panels[id];
        if (!panel)
          return error(404, {
            status: "error",
            detail: `target panel '${id}' does not exist`,
          });

        const b = panel.bindings.find((b) => b.cell.name === name);
        if (!b)
          return error(404, {
            status: "error",
            detail: `target binding '${name}' does not exist`,
          });

        // switch to next status.
        const defs = b.cell.defs;
        b.current = defs[(defs.indexOf(b.current) + 1) % defs.length];

        const shouldEmit = (cell: Cell) => {
          if (cell.emit === undefined) {
            return cell.defs.length === 1;
          }
          return cell.emit;
        };

        if (shouldEmit(b.cell)) {
          panel.emitter.emit({ [content.name]: b.current.value });
        }

        return json({ status: "ok" });
      }).fetch;
  }

  definitionUpdate(current: PanelModel, updated: PanelModel): PanelModel {
    const bindings = [];
    for( const b of updated.bindings) {
      const cb = current.bindings.find(
        (cb) => cb.cell.name === b.cell.name
      );

      if (cb) {
        bindings.push({cell: b.cell, current: cb.current});
      } else {
        bindings.push(b);
      }
    }

    return {
      ...updated,
      bindings,
    };
  }

  constructPanel(action: DefineAction, emitter: EventEmitter): PanelModel {
    const defaultStatus: Status = {
      text: "",
      color: "base",
      value: "",
    };

    return {
      name: action.args.name,
      width: action.args.width,
      height: action.args.height,
      bindings: action.args.cells.map((cell) => ({
        cell,
        current: cell.defs.length === 0
          ? defaultStatus
          : cell.defs[0],
      })),
      emitter,
    };
  }

  public async initialize(
    action: PanelAction,
    emitter: EventEmitter,
  ): Promise<void> {
    switch (action.action) {
      case "":
        this.panels = {};
        return;
      case "define":
        this.panels[action.id] = this.constructPanel(action, emitter);
        return;
      default:
        // none to do.
        return;
    }
  }

  public async process(action: PanelAction, emitter: EventEmitter): Promise<Field> {
    switch (action.action) {
      case "":
        // none to do.
        return undefined;
      case "define": {
        const updated = this.constructPanel(action, emitter);
        const current = this.panels[action.id] || updated;
        const panel = this.definitionUpdate(current, updated);
        this.panels[action.id] = panel;

        return panel.bindings
          .filter(b => b.cell.discharge || b.cell.defs.length > 1)
          .reduce(
            (acc: Environment, b: Binding) => {
              acc[b.cell.name] = b.current.value;
              return acc;
            },
            {},
          );
      }
      default:
        return undefined;
    }
  }
}
