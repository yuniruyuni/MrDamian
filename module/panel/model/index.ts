import type { EventEmitter, Field } from 'module/lib';

export type Color = string | "base" | "info" | "success" | "warning" | "error";

// Status expresses a cell's status.
// this status will be displayed in the cell.
export type Status = {
  text: string;
  color: Color;
  value: Field;
};

export type Cell = {
  name: string;
  // make events when the cell was clicked.
  // if only single status is defined, emit will be default true.
  emit?: boolean;
  // discharge current status value into pipeline when event has come in panel component.
  // if more than two statuses are defined, discharge will be default true.
  discharge?: boolean;
  // a list of cell status.
  // when user click the cell,
  // the cell's current status will be switch into next one, and
  // it will emit an event (if emit = true.)
  defs: Status[];
};

export type Binding = {
  cell: Cell;
  current: Status;
};

export type Panel = {
  name?: string;
  width: number;
  height: number;
  bindings: Binding[];
  emitter: EventEmitter;
};

export type Panels = { [key: string]: Panel };
