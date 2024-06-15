import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

type TranslateParametes = ComponentParameters;

export class Translate extends Component<TranslateParametes> {
  public async run(envs: TranslateParametes): Promise<Environment> {
    // TODO: implement
    return {};
  }
}
