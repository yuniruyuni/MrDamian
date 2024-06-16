import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

type TranslateConfig = ComponentConfig;

export class Translate extends Component<TranslateConfig> {
  public async run(): Promise<Field> {
    // TODO: implement
    return {};
  }
}
