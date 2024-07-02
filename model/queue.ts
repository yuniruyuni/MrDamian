export class Queue<T> {
  aborted: boolean;
  data: T[];
  waiting: ((item: undefined) => void)[];

  constructor() {
    this.aborted = false;
    this.data = [];
    this.waiting = [];
  }

  push(item: T) {
    if (this.aborted) return;

    this.data.push(item);
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      if (!resolve) return;
      resolve(undefined);
    }
  }

  async pop(): Promise<T | undefined> {
    if (this.data.length === 0) {
      await new Promise((resolve) => {
        this.waiting.push(resolve);
      });
    }
    if (this.aborted) return undefined;
    return this.data.shift();
  }

  abort() {
    this.aborted = true;
    for (const resolve of this.waiting) {
      if (!resolve) continue;
      resolve(undefined);
    }
  }
}
