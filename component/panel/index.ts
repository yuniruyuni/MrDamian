import { Component } from "~/model/component";
import type { ComponentConfig } from "~/model/parameters";
import type { Fetch } from "~/model/server";
import type { Field } from "~/model/variable";

type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
  get fetch(): Fetch {
    return async (req: Request): Promise<Response> => {
      const url = new URL(req.url);
      if (url.pathname === "/") {
        return new Response("<h1>Panel configuration</h1>", {
          status: 200,
          headers: { "Content-Type": "text/html" },
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
