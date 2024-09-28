// https://2ality.com/2016/10/asynchronous-iteration.html
export async function computeAsyncOneAtTime(iterable: Iterable<() => Promise<void>>) {
  const res = [];
  for await (const f of iterable) {
    res.push(await f());
  }
  return res;
}

export function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

interface AsyncPoolTask {
  v: () => Promise<void>;
  p: number;
}

export class AsyncPool {
  cur = 0;
  private finished: Promise<boolean>;
  private _resolve?: (value: boolean | PromiseLike<boolean>) => void;

  public static async doNAsyncAtOnce(max = 1, pool: Array<AsyncPoolTask | (() => Promise<void>)>) {
    const spool = new AsyncPool(max);
    pool.forEach(f => spool.push(f));
    return spool.run();
  }

  constructor(private max = 1, private pool: Array<AsyncPoolTask> = []) {
    this.finished = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }

  private getHighPriorityFirst(p = 0): (() => Promise<void>) | undefined {
    if (p > 3 || this.pool.length === 0) return undefined;
    const i = this.pool.findIndex((e) => e.p === p);
    if (i >= 0) {
      const res = this.pool[i].v;
      this.pool.splice(i, 1);
      return res;
    }
    return this.getHighPriorityFirst(p + 1);
  }

  private async runTask() {
    const taskFunc = this.getHighPriorityFirst();
    if (!taskFunc) {
      this.checkCompletion();
      return;
    }

    this.cur++;
    try {
      await taskFunc();
    } catch (error) {
      console.error("Task execution failed:", error);
    } finally {
      this.cur--;
      this.runTasks();
    }
  }

  private checkCompletion() {
    if (this.pool.length === 0 && this.cur === 0) {
      this._resolve?.(true);
    }
  }

  private runTasks() {
    while (this.cur < this.max) {
      this.runTask();
    }
  }

  public async run() {
    this.runTasks();
    return this.finished;
  }

  public push(x: AsyncPoolTask | (() => Promise<void>)) {
    this.pool.push('p' in x ? x : { v: x, p: 0 });
  }
}

