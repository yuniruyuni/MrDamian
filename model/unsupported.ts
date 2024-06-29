import { Component } from "./component";
import type { ComponentConfig } from "./config";
import type { Field } from "./variable";

export class Unsupported extends Component<ComponentConfig> {
  async process(): Promise<Field> {
    // just ignore all things.
    return undefined;
  }
}