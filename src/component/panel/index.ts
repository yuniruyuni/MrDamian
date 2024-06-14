import { Component } from '../../model/module';
import { type Variables } from '../../model/variable';

export class Panel extends Component {
    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("panel component is running with", envs);
        return {};
    }
}