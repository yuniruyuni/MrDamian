import { setTimeout } from "node:timers/promises";

import type { Field } from "mrdamian-plugin";
import Component from "./main";
import type { Cell } from "./model";

const emit = {
  emit: (e: Field) => {
    console.log(e);
  },
};

const cells: Cell[] = [
  {
    name: "button-test",
    emit: true,
    discharge: false,
    defs: [
      {
        text: "hoge",
        color: "primary",
        value: true,
      },
    ]
  },
  {
    name: "toggle-test",
    emit: true,
    discharge: false,
    defs: [
      {
        text: "on",
        color: "neutral",
        value: true,
      },
      {
        text: "off",
        color: "neutral",
        value: false,
      },
    ]
  },
  {
    name: "auto_shoutout",
    defs: [
      {
        text: "auto shoutout on",
        color: "#ff0000",
        value: true,
      },
      {
        text: "auto shoutout off",
        color: "#0000FF",
        value: false,
      },
    ]
  },
  {
    name: "colors",
    defs: [
      {
        text: "base",
        color: "base",
        value: "base",
      },
      {
        text: "info",
        color: "info",
        value: "info",
      },
      {
        text: "success",
        color: "success",
        value: "success",
      },
      {
        text: "warning",
        color: "warning",
        value: "warning",
      },
      {
        text: "error",
        color: "error",
        value: "error",
      },
    ]
  },
];

const comp = new Component();
await comp.initialize({
  id: "/0",
  type: "panel",
  name: "main",
  action: "",
}, emit);

await comp.initialize({
  id: "/1",
  type: "panel",
  name: "main",
  action: "define",
  args: {
    name: "shoutout",
    width: 2,
    height: 2,
    cells,
  },
}, emit);

const loop = async () => {
  for (;;) {
    await comp.process({
      id: "/0",
      type: "panel",
      name: "main",
      action: "",
    }, emit);

    const field = await comp.process({
      id: "/1",
      type: "panel",
      name: "main",
      action: "define",
      args: {
        name: "shoutout",
        width: 2,
        height: 2,
        cells,
      },
    }, emit);
    console.log(field);
    await setTimeout(1000);
  }
};
loop();

export default {
  port: 3000,
  fetch: await comp.fetch(),
};
