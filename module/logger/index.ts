import fs from "node:fs/promises";
import path from "node:path";
import type { Action, Component, Field } from "module/lib";

type LoggerAction = Action & {
	args: {
		path: string;
		output: Field;
	};
};

export default class Logger implements Component<LoggerAction> {
	public async process(action: LoggerAction): Promise<Field> {
		const file = action.args.path;
		const dir = path.dirname(file);

		await fs.mkdir(dir, { recursive: true });
		await fs.appendFile(file, `${JSON.stringify(action.args.output)}\n`);

		return undefined;
	}
}
