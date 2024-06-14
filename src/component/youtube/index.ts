import { type ComponentParameters } from '../../model/parameters'
import { Component } from '../../model/component'
import { type Environment } from '../../model/variable'

type YoutubeParameters = ComponentParameters

export class Youtube extends Component<YoutubeParameters> {
  public run(envs: YoutubeParameters): Environment {
    // TODO: implement
    console.log('youtube componentn is running with', envs)
    return {}
  }
}
