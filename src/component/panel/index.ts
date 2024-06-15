import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

type PanelConfig = ComponentConfig;
export class Panel extends Component<PanelConfig> {
  public async run(): Promise<Field> {
    // TODO: implement
    return undefined;
  }
}
