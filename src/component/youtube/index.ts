import { Component } from '../../model/module';
import { type Variables } from '../../model/variable';

export class Youtube extends Component {
    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("youtube componentn is running with", envs);
        return {};
    }
}