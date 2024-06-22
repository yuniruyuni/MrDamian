// Server is an interface for the server.
export interface Server {
  route(path: string): Route;
}

export type Stream = unknown;

export type JSONPrimitive = string | number | boolean | null;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

// Route expresses sub-route for a component.
// It is used to define the HTTP endpoints for a component.
export interface Route {
  get(path: string, handler: Handler): void;
  post(path: string, handler: Handler): void;
  put(path: string, handler: Handler): void;
  patch(path: string, handler: Handler): void;
  delete(path: string, handler: Handler): void;
}

// biome-ignore lint: HandlerResponse can contains any values.
export type HandlerResponse = any | Promise<any>;

// Handler is a function that handles a request.
export type Handler = (context: Context) => HandlerResponse;

export type Context = {
    req: Request;
    res: Response;
};

export interface Request {
  text(): Promise<string>;
  json<T>(): Promise<T>;
}

export interface Response {
  header(key: string, value: string): Response;
  status(code: number): Response;
  javascript(js: string): Promise<Stream>;
  html(html: string): Promise<Stream>;
  json(obj: JSONValue): Promise<Stream>;
}
