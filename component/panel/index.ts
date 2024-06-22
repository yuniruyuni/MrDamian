import { Component } from "~/model/component";
import type { ComponentConfig } from "~/model/parameters";
import type { Route } from "~/model/server";
import type { Field } from "~/model/variable";

type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
  public async register(route: Route): Promise<void> {
    route.get("/", (conn) => {
      return conn.res.html("<h1>Hello, World!</h1>");
    });
  }

  public async run(): Promise<Field> {
    // TODO: implement
    return undefined;
  }
}
