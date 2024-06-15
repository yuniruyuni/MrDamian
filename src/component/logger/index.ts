import { type Environment } from '../../model/variable';
import { type ComponentParameters } from '../../model/parameters';
import { Component } from '../../model/component';
import fs from 'fs/promises';
import path from 'path';

type LoggerParameters = ComponentParameters & {
  path: string;
};

export class Logger extends Component<LoggerParameters> {
  public async run(envs: LoggerParameters): Promise<Environment> {
    console.log('logger component is running with', envs);

    if( envs.path ) {
      const file = envs.path;
      const dir = path.dirname(file);
      delete envs.type;
      delete envs.path;

      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(file, JSON.stringify(envs) + "\n");
    }

    return {};
  }
}
