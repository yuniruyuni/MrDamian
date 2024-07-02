import { describe, expect, it } from "bun:test";

import { Queue } from "~/model/queue";

describe("Queue", () => {
  it("pop ordering is aligned with push ordering (FIFO)", async () => {
    const queue = new Queue<number>();
    queue.push(1);
    queue.push(2);
    expect(await queue.pop()).toBe(1);
    queue.push(3);
    expect(await queue.pop()).toBe(2);
    expect(await queue.pop()).toBe(3);
  });

  it("can block pop before push item", async () => {
    const queue = new Queue<number>();
    const blocked = queue.pop();
    queue.push(1);
    expect(await blocked).toBe(1);
  });

  it("is reusable after pop all items", async () => {
    const queue = new Queue<number>();
    queue.push(1);
    expect(await queue.pop()).toBe(1);
    const blocked = queue.pop();
    queue.push(2);
    expect(await blocked).toBe(2);
  });

  it("blocking multiple pop before item push", async () => {
    const queue = new Queue<number>();
    const blocked1 = queue.pop();
    const blocked2 = queue.pop();
    queue.push(1);
    queue.push(2);
    expect(await blocked1).toBe(1);
    expect(await blocked2).toBe(2);
  });

  it("can abort", async () => {
    const queue = new Queue<number>();
    const blocked = queue.pop(); // make promise to check blocking is aborted.
    queue.abort();
    expect(await blocked).toBeUndefined();
  });

  it("can abort multiple pop", async () => {
    const queue = new Queue<number>();
    const blocked1 = queue.pop();
    const blocked2 = queue.pop();
    const blocked3 = queue.pop();
    queue.abort();
    expect(await blocked1).toBeUndefined();
    expect(await blocked2).toBeUndefined();
    expect(await blocked3).toBeUndefined();
  });

  it("ignore push after abort", async () => {
    const queue = new Queue<number>();
    const blocked1 = queue.pop();
    queue.abort();
    queue.push(1);
    expect(await blocked1).toBeUndefined();
  });

  it("ignore pop after abort", async () => {
    const queue = new Queue<number>();
    queue.push(1);
    queue.abort();
    expect(await queue.pop()).toBeUndefined();
  });
});
