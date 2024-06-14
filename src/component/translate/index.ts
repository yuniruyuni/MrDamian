import { Component } from '../../model/module';
import { type Variables } from '../../model/variable';

export class Translate extends Component {
    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("translate component is running with", envs);
        return {};
    }
}