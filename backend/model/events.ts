// importing src/queue for typechecking
// refer: https://github.com/baji-ismail/in-queue/issues/3
import Queue from "in-queue/src/queue";
import type { Environment, Field } from "./variable";

class EventChannel {
  queue: Queue<Environment>;

  constructor() {
    this.queue = new Queue();
  }

  emit(item: Environment) {
    // our queue length is infinite so this method never fail.
    this.queue.push(item);
  }

  async absorb(timeout?: number): Promise<Environment> {
    return await this.queue.get(timeout);
  }
}

export class EventAbsorber {
  channel: EventChannel;
  constructor(channel: EventChannel) {
    this.channel = channel;
  }

  async absorb(timeout?: number): Promise<Environment> {
    return await this.channel.absorb(timeout);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Environment> {
    while (true) {
      yield await this.absorb();
    }
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

export class NamedEventEmitter {
  emitter: EventEmitter;
  keys: string[];
  constructor(emitter: EventEmitter, keys: string[]) {
    console.assert(keys.length > 0);

    this.emitter = emitter;
    this.keys = keys;
  }

  emit(field: Field): void {
    let obj = field;
    for (const key of this.keys.reverse()) {
      obj = { [key]: obj };
    }
    // key must not be 0-length, so obj will be always Environment.
    this.emitter.emit(obj as Environment);
  }
}