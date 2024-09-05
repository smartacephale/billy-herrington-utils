export class Observer {
  public observer: IntersectionObserver;
  constructor(private callback: (entry: Element) => void) {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }

  observe(target: Element) {
    this.observer.observe(target);
  }

  throttle(target: Element, throttleTime: number) {
    this.observer.unobserve(target);
    setTimeout(() => this.observer.observe(target), throttleTime);
  }

  handleIntersection(entries: Iterable<IntersectionObserverEntry>) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target);
      }
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static observeWhile(target: Element, callback: any, throttleTime: number) {
    const observer_ = new Observer(async (target: Element) => {
      const condition = await callback();
      if (condition) observer_.throttle(target, throttleTime);
    });
    observer_.observe(target);
    return observer_;
  }
}

export class LazyImgLoader {
  public lazyImgObserver: Observer;
  constructor(callback: (target: Element, delazify: (target: HTMLImageElement) => void) => void,
    private attributeName = 'data-lazy-load', private removeTagAfter = true) {
    this.lazyImgObserver = new Observer((target: Element) => {
      callback(target, this.delazify);
    });
  }

  lazify(_target: Element, img: HTMLImageElement, imgSrc: string) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = '';
    this.lazyImgObserver.observe(img);
  }

  delazify = (target: HTMLImageElement) => {
    this.lazyImgObserver.observer.unobserve(target);
    target.src = target.getAttribute(this.attributeName) as string;
    if (this.removeTagAfter) target.removeAttribute(this.attributeName);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static create(callback: any) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const lazyImgLoader = new LazyImgLoader((target: Element, delazify: any) => {
      if (callback(target)) {
        delazify(target);
      }
    });
    return lazyImgLoader;
  }
}
