import express, { type Express } from 'express';
import {type AddressInfo} from 'net';

const port = 54976;

export function upserver(): Express {
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

  return app;
}
