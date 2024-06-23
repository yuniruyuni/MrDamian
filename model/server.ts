export type Fetch = (request: Request) => Response | Promise<Response>;
export interface Server {
  mount(route: string, fetch: Fetch): Server;
}
