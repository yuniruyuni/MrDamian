import { type Environment, type Field, Path } from "mrdamian-plugin";
import { Queue } from "~/model/queue";
import type { NonEmptyArray } from "~/model/types";

class EventChannel {
  queue: Queue<Environment>;

  constructor() {
    this.queue = new Queue();
  }

  get aborted(): boolean {
    return this.queue.aborted;
  }

  abort() {
    this.queue.abort();
  }

  emit(item: Environment) {
    // our queue length is infinite so this method never fail.
    this.queue.push(item);
  }

  async absorb(): Promise<Environment | undefined> {
    return await this.queue.pop();
  }
}

export class EventAbsorber {
  channel: EventChannel;
  constructor(channel: EventChannel) {
    this.channel = channel;
  }

  async absorb(): Promise<Environment | undefined> {
    return this.channel.absorb();
  }

  abort() {
    this.channel.abort();
  }

  get aborted(): boolean {
    return this.channel.aborted;
  }
}

export class EventEmitter {
  channel: EventChannel;
  constructor(channel: EventChannel) {
    this.channel = channel;
  }

  emit(item: Environment): void {
    this.channel.emit(item);
  }
}

export function eventChannel(): [EventEmitter, EventAbsorber] {
  const channel = new EventChannel();
  return [new EventEmitter(channel), new EventAbsorber(channel)];
}

export class EmitterStack {
  stack: NonEmptyArray<EventEmitter>;

  constructor(stack: NonEmptyArray<EventEmitter>) {
    this.stack = stack;
  }

  push(e: EventEmitter): EmitterStack {
    return new EmitterStack([e, ...this.stack]);
  }

  emit(event: Environment, path: Path = Path.local) {
    const e = this.pathOf(path);
    if (!e) return;
    e.emit(event);
  }

  pathOf(path: Path): EventEmitter {
    const index =
      path < 0
        ? this.stack.length + (path % this.stack.length)
        : path % this.stack.length;
    return this.stack[index];
  }
}

export const KeyNotExistError = new Error("keys length should not be zero");

export class NamedEventEmitter {
  stack: EmitterStack;
  keys: string[];
  constructor(stack: EmitterStack, keys: string[]) {
    if (keys.length <= 0) throw KeyNotExistError;

    this.stack = stack;
    this.keys = keys;
  }

  emit(field: Field, path: Path = Path.local): void {
    let obj = field;
    for (const key of this.keys.reverse()) {
      obj = { [key]: obj };
    }
    // key must not be 0-length, so obj will be always Environment.
    this.stack.emit(obj as Environment, path);
  }
}
