import { Component, type ComponentConfig, type Field } from "mrdamian-plugin";

export class Unsupported extends Component<ComponentConfig> {
  async process(): Promise<Field> {
    // just ignore all things.
    return undefined;
  }
}
