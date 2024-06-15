import { type Environment } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

type TranslateConfig = ComponentConfig;

export class Translate extends Component<TranslateConfig> {
  public async run(): Promise<Environment> {
    // TODO: implement
    return {};
  }
}
