import { Component } from "../../../model/component";
import type { ComponentConfig } from "../../../model/parameters";
import type { Field } from "../../../model/variable";

type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
  public async run(): Promise<Field> {
    // TODO: implement
    return undefined;
  }
}
