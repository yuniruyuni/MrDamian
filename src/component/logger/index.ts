import { type Environment } from '../../model/variable';
import { type ComponentConfig } from '../../model/config';
import { Component } from '../../model/module';

type LoggerConfig = ComponentConfig;

export class Logger extends Component<LoggerConfig> {
    public run(envs: Environment): Environment {
        // TODO: implement
        console.log("logger component is running with", envs);
        return {};
    }
}
