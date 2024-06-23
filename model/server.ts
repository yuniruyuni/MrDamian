export type Fetch = (request: Request) => Response | Promise<Response>;
export interface Server<T extends Server<T>> {
  mount(route: string, fetch: Fetch): T;
}
