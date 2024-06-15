import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

type PanelParameters = ComponentParameters;
export class Panel extends Component<PanelParameters> {
  public run(envs: PanelParameters): Environment {
    // TODO: implement
    console.log('panel component is running with', envs);
    return {};
  }
}
