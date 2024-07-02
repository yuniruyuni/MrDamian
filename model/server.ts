import type { Fetch } from "mrdamian-plugin";
export interface Server<T extends Server<T>> {
  mount(route: string, fetch: Fetch): T;
}
