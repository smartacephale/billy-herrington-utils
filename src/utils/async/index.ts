// https://2ality.com/2016/10/asynchronous-iteration.html
export async function computeAsyncOneAtTime(iterable: Iterable<() => Promise<void>>) {
  const res = [];
  for await (const f of iterable) {
    res.push(await f());
  }
  return res;
}

export function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

interface SyncPullObject {
  v: () => Promise<void>,
  p: number
}

export class SyncPull {
  pull: Array<SyncPullObject> = [];
  lock = false;

  getHighPriorityFirst(p = 0): (() => Promise<void>) | undefined {
    if (p > 3 || this.pull.length === 0) return undefined;
    const i = this.pull.findIndex(e => e.p === p);
    if (i >= 0) {
      const res = this.pull[i].v;
      this.pull = this.pull.slice(0, i).concat(this.pull.slice(i + 1));
      return res;
    }
    return this.getHighPriorityFirst(p + 1);
  }

  *pullGenerator() {
    while (this.pull.length > 0) {
      yield this.getHighPriorityFirst();
    }
  }

  async processPull() {
    if (!this.lock) {
      this.lock = true;
      for await (const f of this.pullGenerator()) {
        await f?.();
      }
      this.lock = false;
    }
  }

  push(x: SyncPullObject) {
    this.pull.push(x);
    this.processPull();
  }
}
