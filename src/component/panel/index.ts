import { type ComponentConfig } from '../../model/config';
import { type Variables } from '../../model/variable';

export class Panel {
    // TODO: implement
    config: ComponentConfig;
    variables: Variables;

    public run(envs: Variables): Variables {
        // TODO: implement
        console.log("panel component is running with", envs);
        return {};
    }
}