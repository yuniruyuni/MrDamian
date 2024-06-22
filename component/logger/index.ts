import fs from "node:fs/promises";
import path from "node:path";
import { Component } from "~/model/component";
import type { ComponentConfig } from "~/model/parameters";
import type { Field } from "~/model/variable";

type LoggerConfig = ComponentConfig & {
  args: {
    path: string;
    output: Field;
  };
};

export class Logger extends Component<LoggerConfig> {
  public async run(config: LoggerConfig): Promise<Field> {
    const file = config.args.path;
    const dir = path.dirname(file);

    await fs.mkdir(dir, { recursive: true });
    await fs.appendFile(file, `${JSON.stringify(config.args.output)}\n`);

    return undefined;
  }
}
