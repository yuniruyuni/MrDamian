import type { Action } from "mrdamian-plugin";
import type { FilledComponent } from "~/model/component";

export type Instances = Map<string, FilledComponent<Action>>;
export function newInstances(): Instances {
  return new Map();
}
