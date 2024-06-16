import { setTimeout } from 'timers/promises';

import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

type PeriodicConfig = ComponentConfig & {
  interval: number;
};

export class Periodic extends Component<PeriodicConfig> {
  async init(config: PeriodicConfig): Promise<Field> {
    this.start(config);
    return undefined;
  }
  async run(): Promise<Field> {
    return undefined;
  }
  async start(config: PeriodicConfig): Promise<void> {
    for( ; ; ) {
      await setTimeout(config.interval);
      this.emit(true);
    }
  }
}
