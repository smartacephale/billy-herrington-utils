export function listenEvents(dom: HTMLElement | Element, events: Array<string>, callback: (e: Event) => void): void {
  for (const e of events) {
    dom.addEventListener(e, callback, true);
  }
}

export class Tick {
  private tick?: number;
  private callbackFinal?: () => void;

  constructor(private delay: number, private startImmediate: boolean = true) {}

  public start(callback: () => void, callbackFinal?: () => void): void {
    this.stop();
    this.callbackFinal = callbackFinal;
    if (this.startImmediate) callback();
    this.tick = window.setInterval(callback, this.delay);
  }

  public stop(): void {
    if (this.tick !== undefined) {
      clearInterval(this.tick);
      this.tick = undefined;
    }
    if (this.callbackFinal) {
      this.callbackFinal();
      this.callbackFinal = undefined;
    }
  }
}
