export function listenEvents(dom: HTMLElement | Element, events: Array<string>, callback: (e: Event) => void): void {
  for (const e of events) {
    dom.addEventListener(e, callback, true);
  }
}

export class Tick {
  private tick: null | number;
  private callbackFinal: (() => void) | undefined;

  constructor(private delay: number, private startImmediate = true) {
    this.tick = null;
    this.delay = delay;
    this.startImmediate = startImmediate;
  }

  start(callback: () => void, callbackFinal = undefined) {
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
      this.callbackFinal = undefined;
    }
  }
}