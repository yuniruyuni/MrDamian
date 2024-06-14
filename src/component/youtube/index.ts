import { type ComponentConfig } from '../../model/config';
import { Component } from '../../model/module';
import { type Environment } from '../../model/variable';

type YoutubeConfig = ComponentConfig;

export class Youtube extends Component<YoutubeConfig> {
    public run(envs: Environment): Environment {
        // TODO: implement
        console.log("youtube componentn is running with", envs);
        return {};
    }
}
