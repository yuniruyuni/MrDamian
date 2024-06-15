import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';
import { type Field } from '../../model/variable';

type YoutubeConfig = ComponentConfig;

export class Youtube extends Component<YoutubeConfig> {
  public async run(): Promise<Field> {
    // TODO: implement
    return {};
  }
}
