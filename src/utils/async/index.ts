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

interface SyncPoolObject {
  v: () => Promise<void>,
  p: number
}

export class AsyncPool {
  cur = 0;
  private finished: Promise<boolean>;
  private _resolve?: (value: boolean | PromiseLike<boolean>) => void;

  constructor(private max = 1, private pool: Array<SyncPoolObject> = []) {
    this.finished = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  getHighPriorityFirst(p = 0): (() => Promise<void>) | undefined {
    if (p > 3 || this.pool.length === 0) return undefined;
    const i = this.pool.findIndex(e => e.p === p);
    if (i >= 0) {
      const res = this.pool[i].v;
      this.pool = this.pool.slice(0, i).concat(this.pool.slice(i + 1));
      return res;
    }
    return this.getHighPriorityFirst(p + 1);
  }

  async runTask() {
    this.cur++;
    const f = this.getHighPriorityFirst();
    await f?.();
    this.cur--;
    this.runTasks();
  }

  runTasks() {
    if (!this.pool.length) this._resolve?.(true);
    if (this.cur < this.max) {
      this.runTask();
      this.runTasks();
    }
  }

  async run() {
    this.runTasks();
    return this.finished;
  }

  push(x: SyncPoolObject | (() => Promise<void>)) {
    this.pool.push('p' in x ? x : ({ v: x, p: 0 }));
  }
}