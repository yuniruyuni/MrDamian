import { Component } from "../../../model/component";
import type { ComponentConfig } from "../../../model/parameters";
import type { Field } from "../../../model/variable";

type TranslateConfig = ComponentConfig;

export class Translate extends Component<TranslateConfig> {
  public async run(): Promise<Field> {
    // TODO: implement
    return {};
  }
}
