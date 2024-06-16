import { type Field } from '../../model/variable';
import { type ComponentConfig } from '../../model/parameters';
import { Component } from '../../model/component';
import fs from 'fs/promises';
import path from 'path';

type LoggerArgs = {
  path: string;
  output: Field;
};

type LoggerConfig = ComponentConfig & {
  args: LoggerArgs;
};

export class Logger extends Component<LoggerConfig> {
  public async run(config: LoggerConfig): Promise<Field> {
    const file = config.args.path;
    const dir = path.dirname(file);

    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(file, JSON.stringify(config.args.output) + '\n');

    return undefined;
  }
}
