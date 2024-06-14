import { type Environment } from '../../model/variable';
import { type ComponentConfig } from '../../model/config';
import { Component } from '../../model/module';

type TranslateConfig = ComponentConfig;

export class Translate extends Component<TranslateConfig> {
    public run(envs: Environment): Environment {
        // TODO: implement
        console.log("translate component is running with", envs);
        return {};
    }
}
