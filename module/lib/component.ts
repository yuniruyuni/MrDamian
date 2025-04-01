import type { Action } from "./action";
import type { Field } from "./environment";
import type { EventEmitter } from "./event";
import type { Fetch } from "./fetch";

export interface Component<A extends Action> {
  // fetch is used to define this component's http endpoints.
  // if you didn't write this function in your component, it will be generated automatically.
  fetch?(): Promise<Fetch>;

  // initialize is called when pipeline is constructing.
  // if you didn't write this function in your component, it will be generated automatically.
  initialize?(action: A, emitter: EventEmitter): Promise<void>;
  // start is called when pipeline is starting.
  // if you didn't write this function in your component, it will be generated automatically.
  start?(action: A, emitter: EventEmitter): Promise<void>;
  // process is called when pipeline event has come.
  // if you didn't write this function in your component, it will be generated automatically.
  process?(action: A, emitter: EventEmitter): Promise<Field>;
  // stop is called when pipeline is stopping.
  // if you didn't write this function in your component, it will be generated automatically.
  stop?(action: A, emitter: EventEmitter): Promise<void>;
  // finalize is called when pipeline is reconstructing.
  // if you didn't write this function in your component, it will be generated automatically.
  finalize?(action: A, emitter: EventEmitter): Promise<void>;
}