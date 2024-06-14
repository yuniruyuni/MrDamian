import { type ComponentConfig } from '../../model/config';
import { type Variables } from '../../model/variable';

export class Translate {
    // TODO: implement
    config: ComponentConfig;
    variables: Variables;

    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("translate component is running with", envs);
        return {};
    }
}