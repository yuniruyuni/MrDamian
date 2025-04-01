import dayjs from "dayjs";
import type { Action, Component, Field } from "module/lib";

export type DatetimeAction = Action & {
  args: {
    format: string;
  };
};

export default class Datetime implements Component<DatetimeAction> {
  async process(action: DatetimeAction): Promise<Field> {
    return dayjs().format(action.args.format);
  }
}
