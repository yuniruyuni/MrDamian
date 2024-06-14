import { Component } from '../../model/module';
import { type Variables } from '../../model/variable';

export class Logger extends Component {
    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("logger component is running with", envs);
        return {};
    }
}