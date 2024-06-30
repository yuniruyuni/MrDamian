import type { Serve } from "bun";
import open from "open";

import { App } from "~/backend/app";

const app = new App();
await app.reload();

// for once open browser.
// refer: https://bun.sh/docs/runtime/hot
declare global {
  var alreadyRun: boolean;
}
globalThis.alreadyRun ??= false;
if (!globalThis.alreadyRun) {
  open("http://localhost:3000");
  globalThis.alreadyRun = true;
}

export default {
  port: 3000,
  fetch: (req) => {
    // we need to fix `this` object for fetch() method,
    // so we use arrow function here.
    return app.fetch(req);
  },
} satisfies Serve;
