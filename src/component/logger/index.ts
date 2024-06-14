import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';

type LoggerParameters = ComponentParameters;

export class Logger extends Component<LoggerParameters> {
    public run(envs: LoggerParameters): Environment {
        // TODO: implement
        console.log("logger component is running with", envs);
        return {};
    }
}
