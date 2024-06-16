import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';

import dayjs from 'dayjs';

type DatetimeConfig = ComponentConfig & {
  args: {
    format: string;
  };
};

export class Datetime extends Component<DatetimeConfig> {
  async run(config: DatetimeConfig): Promise<Field> {
    return dayjs().format(config.args.format);
  }
}
