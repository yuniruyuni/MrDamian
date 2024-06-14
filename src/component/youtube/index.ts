import { type ComponentConfig } from '../../model/config';
import { Component } from '../../model/component';
import { type Environment } from '../../model/variable';

type YoutubeConfig = ComponentConfig;

export class Youtube extends Component<YoutubeConfig> {
    public run(envs: YoutubeConfig): Environment {
        // TODO: implement
        console.log("youtube componentn is running with", envs);
        return {};
    }
}
