// https://2ality.com/2016/10/asynchronous-iteration.html
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function computeAsyncOneAtTime(iterable: Iterable<any>) {
  const res = [];
  for await (const f of iterable) {
    res.push(await f());
  }
  return res;
}

export function wait(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

// do async one at time
export class SyncPull {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  pull: Array<any> = [];
  lock = false;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getHighPriorityFirst(p = 0): any {
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
        await f();
      }
      this.lock = false;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  push(x: any) {
    this.pull.push(x);
    this.processPull();
  }
}
