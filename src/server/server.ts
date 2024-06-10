import express from 'express';
import {type AddressInfo} from 'net';

import { assign_twitch_oauth_endpoints } from './twitch_oauth';

const port = 54976;

export function upserver() {
  const app = express();

  const server = app.listen(port, () => {
    const info: AddressInfo = server.address() as AddressInfo;
    const host = info.address;
    const port = info.port;
    console.info(`Listening on: http://${host}:${port}/`);
  });

  app.get('/', (_, res) => {
    res.send('にぱ〜✨');
  });

  assign_twitch_oauth_endpoints(app);
}
