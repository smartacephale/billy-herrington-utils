// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function listenEvents(dom: HTMLElement | Element, events: Array<string>, callback: any): void {
  for (const e of events) {
    dom.addEventListener(e, callback, true);
  }
}

export class Tick {
  private tick: null | number;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private callbackFinal: any;

  constructor(private delay: number, private startImmediate = true) {
    this.tick = null;
    this.delay = delay;
    this.startImmediate = startImmediate;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  start(callback: any, callbackFinal = null) {
    this.stop();
    this.callbackFinal = callbackFinal;
    if (this.startImmediate) callback();
    this.tick = setInterval(callback, this.delay);
  }

  stop() {
    if (this.tick !== null) {
      clearInterval(this.tick);
      this.tick = null;
    }
    if (this.callbackFinal) {
      this.callbackFinal();
      this.callbackFinal = null;
    }
  }
}