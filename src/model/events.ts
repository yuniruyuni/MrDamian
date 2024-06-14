import Queue from 'in-queue';
import { Variables } from './variable';

class EventChannel {
    queue: Queue<Variables>;

    constructor() {
        this.queue = new Queue();
    }

    send(item: Variables) {
        // our queue length is infinite so this method never fail.
        this.queue.push_nowait(item);
    }

    async receive(timeout?: number): Promise<Variables> {
        return await this.queue.get(timeout);
    }
}

export class EventReceiver {
    channel: EventChannel;
    constructor(channel: EventChannel) {
        this.channel = channel;
    }

    async receive(timeout?: number): Promise<Variables> {
        return await this.channel.receive(timeout);
    }

    async *[Symbol.asyncIterator](): AsyncIterableIterator<Variables> {
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

    send(item: Variables): void {
        this.channel.send(item);
    }
}

export function eventChannel(): [EventSender, EventReceiver] {
    const channel = new EventChannel();
    return [
        new EventSender(channel),
        new EventReceiver(channel),
    ];
}
