import { Component } from "~/model/component";
import type { ComponentConfig } from "~/model/parameters";
import type { Fetch } from "~/model/server";
import type { Field } from "~/model/variable";

// @ts-ignore-next-line
import css from "~/static/component/panel/index.css" with { type: "text" };
// @ts-ignore-next-line
import js from "~/static/component/panel/root.js" with { type: "text" };
// @ts-ignore-next-line
import html from "./index.html" with { type: "text" };

export type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
  get fetch(): Fetch {
    return async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      if (url.pathname === "/") {
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html" },
        });
      }
      if (url.pathname === "/index.js") {
        return new Response(js, {
          status: 200,
          headers: { "Content-Type": "text/javascript" },
        });
      }
      if (url.pathname === "/index.css") {
        return new Response(css, {
          status: 200,
          headers: { "Content-Type": "text/css" },
        });
      }
      if (url.pathname === "/panels") {
        return new Response(`[{"type":"button", "name": "first"},{"type":"toggle", "name": "secondary"}]`, {
          status: 200,
          headers: { "Content-Type": "text/javascript" },
        });
      }
      return new Response("<p>Not found</p>", {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    };
  }

  public async run(): Promise<Field> {
    // TODO: implement
    return undefined;
  }
}
