import type { Fetch } from '~/model/component';
export interface Server<T extends Server<T>> {
  mount(route: string, fetch: Fetch): T;
}
