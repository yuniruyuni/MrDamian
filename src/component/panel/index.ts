import { type Environment } from '../../model/variable';
import { type ComponentConfig } from '../../model/config';
import { Component } from '../../model/component';

type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
    public run(envs: PanelConfig): Environment {
        // TODO: implement
        console.log("panel component is running with", envs);
        return {};
    }
}
