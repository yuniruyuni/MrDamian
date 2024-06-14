import { type ComponentConfig } from '../../model/config';
import { type Variables } from '../../model/variable';

export class Youtube {
    // TODO: implement
    config: ComponentConfig;
    variables: Variables;

    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("youtube componentn is running with", envs);
        return {};
    }
}