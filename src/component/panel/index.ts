import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

type PanelParameters = ComponentParameters;
export class Panel extends Component<PanelParameters> {
  public async run(envs: PanelParameters): Promise<Environment> {
    // TODO: implement
    return {};
  }
}
