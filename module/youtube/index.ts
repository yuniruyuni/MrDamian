import type { Action, Component, Field } from "mrdamian-plugin";

type YoutubeAction = Action;

export default class Youtube implements Component<YoutubeAction> {
  public async process(): Promise<Field> {
    // TODO: implement
    return undefined;
  }
}
