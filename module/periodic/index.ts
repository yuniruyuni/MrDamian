import { setTimeout } from "node:timers/promises";
import type { Action, Component, EventEmitter } from "module/lib";

type PeriodicAction = Action & {
	interval: number;
};

class Runner {
	running = true;
	stop(){ this.running = false; }
	async run(action: PeriodicAction, emitter: EventEmitter): Promise<void> {
		while( this.running ) {
			await setTimeout(action.interval);
			emitter.emit(true);
		}
	}
}

export default class Periodic implements Component<PeriodicAction> {
	runner: Runner = new Runner();

	async start(action: PeriodicAction, emitter: EventEmitter): Promise<void> {
		this.runner.stop();
		this.runner = new Runner();
		this.runner.run(action, emitter);
	}

	async stop(): Promise<void> {
		this.runner.stop();
		this.runner = new Runner();
	}
}
