import Queue from 'in-queue';
import { Environment } from './variable';

class EventChannel {
  queue: Queue<Environment>;

  constructor() {
    this.queue = new Queue();
  }

  send(item: Environment) {
    // our queue length is infinite so this method never fail.
    this.queue.push(item);
  }

  async receive(timeout?: number): Promise<Environment> {
    return await this.queue.get(timeout);
  }
}

export class EventReceiver {
  channel: EventChannel;
  constructor(channel: EventChannel) {
    this.channel = channel;
  }

  async receive(timeout?: number): Promise<Environment> {
    return await this.channel.receive(timeout);
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<Environment> {
    while (true) {
      yield await this.receive();
    }
  }
}

export class EventSender {
  channel: EventChannel;
  constructor(channel: EventChannel) {
    this.channel = channel;
  }

  send(item: Environment): void {
    this.channel.send(item);
  }
}

export function eventChannel(): [EventSender, EventReceiver] {
  const channel = new EventChannel();
  return [new EventSender(channel), new EventReceiver(channel)];
}
