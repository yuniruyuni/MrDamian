import path from "node:path";
import {
  Hono,
  type Context as HonoContext,
} from "hono";
import { serveStatic } from "hono/bun";
import search from "libnpmsearch";
import { PluginManager } from "live-plugin-manager";

import open from "open";

import type { PluginInfo } from "~/model/plugin";

import { load } from "~/backend/load_config";
import { eventChannel } from "~/model/events";
import { type ComponentGenerators, ModuleFactory } from "~/model/factory";
import type {
  Context,
  Handler,
  JSONValue,
  Request,
  Response,
  Route,
  Server,
  Stream,
} from "~/model/server";

import { Datetime } from "~/component/datetime";
import { DeepL } from "~/component/deepl";
import { Logger } from "~/component/logger";
import { Panel } from "~/component/panel";
import { Periodic } from "~/component/periodic";
import { Translate } from "~/component/translate";
import { Twitch } from "~/component/twitch";
import { Youtube } from "~/component/youtube";

const gens: ComponentGenerators = {
  twitch: Twitch,
  youtube: Youtube,
  deepl: DeepL,

  periodic: Periodic,
  datetime: Datetime,
  logger: Logger,
  panel: Panel,
  translate: Translate,
};

const [emitter, absorber] = eventChannel();
const factory = new ModuleFactory(gens, emitter);
const params = await load("./config/main.json5");

class RequestImpl implements Request {
  context: HonoContext;
  constructor(context: HonoContext) {
    this.context = context;
  }

  async text(): Promise<string> {
    return this.context.req.text();
  }

  async json<T>(): Promise<T> {
    return this.context.req.json<T>();
  }
}

class ResponseImpl implements Response {
  code: 200 | 404;
  context: HonoContext;

  constructor(context: HonoContext) {
    this.code = 200;
    this.context = context;
  }

  header(key: string, value: string): Response {
    this.context.header(key, value);
    return this;
  }

  status(code: 200 | 404): Response {
    this.code = code;
    return this;
  }

  async javascript(js: string): Promise<Stream> {
    this.header("Content-Type", "application/javascript");
    return this.context.text(js, this.code);
  }

  async html(html: string): Promise<Stream> {
    return this.context.html(html, this.code);
  }

  async json(obj: JSONValue): Promise<Stream> {
    const jobj = JSON.stringify(obj);
    this.header("Content-Type", "application/json");
    return this.context.text(jobj, this.code);
  }
}

class RouteImpl implements Route {
  app: Hono;
  root: string;

  constructor(app: Hono, root: string) {
    this.app = app;
    this.root = root;
  }

  private context(context: HonoContext): Context {
    return {
      req: new RequestImpl(context),
      res: new ResponseImpl(context),
    }
  }

  get(subpath: string, handler: Handler) {
    return this.app.get(path.join('/', this.root, subpath), (c) => {
      return handler(this.context(c));
    });
  }

  post(subpath: string, handler: Handler) {
    return this.app.post(path.join('/', this.root, subpath), (c) => {
      return handler(this.context(c));
    });
  }

  put(subpath: string, handler: Handler)  {
    return this.app.put(path.join('/', this.root, subpath), (c) => {
      return handler(this.context(c));
    });
  }

  patch(subpath: string, handler: Handler) {
    return this.app.patch(path.join('/', this.root, subpath), (c) => {
      return handler(this.context(c));
    });
  }

  delete(subpath: string, handler: Handler) {
    return this.app.delete(path.join('/', this.root, subpath), (c) => {
      return handler(this.context(c));
    });
  }
}

class ServerImpl implements Server {
  app: Hono;

  constructor(app: Hono) {
    this.app = app;
  }

  route(path: string): Route {
    return new RouteImpl(this.app, path);
  }
}

const app = new Hono();
const server = new ServerImpl(app);
const mod = factory.constructModule(params);
mod.register(server);

async function run() {

  await mod.init({});

  emitter.emit({
    system: {
      initialied: true,
    },
  });

  for await (const event of absorber) {
    await mod.run(event);
  }
}

const route = server.route('')
route.get("api/module", async (c) => {
  return c.res.json(params as JSONValue);
});
route.post("api/module/run", async (c) => {
  run();
  return c.res.json({ status: "ok" });
});

route.get("api/plugin", async (c) => {
  const packages = await search("mrdamian-plugin");
  return c.res.json(
    packages.map(
      (pkg) =>
        ({
          name: pkg.name,
          description: pkg.description,
          version: pkg.version,
          installed: false,
        }) as PluginInfo,
    ),
  );
});

route.post("api/plugin", async (c) => {
  const params = (await c.req.json()) as { name: string };
  const name = params.name;

  const manager = new PluginManager({
    pluginsPath: path.join(process.cwd(), ".plugins"),
  });
  await manager.installFromNpm(name);

  return c.res.json({ status: "ok" });
});

// TODO: this interface should be exposed from our server model.
server.app.use("/*", serveStatic({ root: "./static" }));

open("http://localhost:3000");

export default {
  port: 3000,
  fetch: app.fetch,
};
