import { fetchHtml } from '../../utils/fetch';
import { Observer } from '../../utils/observers';

interface IInfiniteScroller {
  delay?: number;
  enabled?: boolean;
  writeHistory?: boolean;
  paginationOffset: number;
  paginationLast: number;
  paginationElement: HTMLElement;
  paginationUrlGenerator: (offset: number) => string;
  parseData: (document: HTMLElement) => void;
  intersectionObservable?: HTMLElement;
  alternativeGenerator?: () => OffsetGenerator;
}

interface GeneratorResult {
  url: string;
  offset: number;
}

type OffsetGenerator = Generator<GeneratorResult> | AsyncGenerator<GeneratorResult>;

export class InfiniteScroller {
  public paginationGenerator: OffsetGenerator;
  public enabled: boolean;
  public delay: number;
  public paginationOffset: number;
  public paginationLast: number;
  public writeHistory: boolean;
  private parseData: (document: HTMLElement) => void;

  constructor({
    enabled = true,
    delay = 300,
    writeHistory = false,
    paginationOffset,
    paginationLast,
    paginationElement,
    paginationUrlGenerator,
    parseData,
    alternativeGenerator,
    intersectionObservable,
  }: IInfiniteScroller) {
    this.enabled = enabled;
    this.delay = delay;
    this.writeHistory = writeHistory;
    this.paginationOffset = paginationOffset;
    this.paginationLast = paginationLast;
    this.parseData = parseData;

    this.paginationGenerator =
      alternativeGenerator?.() ??
      InfiniteScroller.createPaginationGenerator(
        paginationOffset,
        paginationLast,
        paginationUrlGenerator,
      );

    const observable = intersectionObservable || paginationElement;
    Observer.observeWhile(observable, this.generatorConsumer, this.delay);
  }

  private onScrollCBs: Array<(scroller: InfiniteScroller) => void> = [];

  public onScroll(callback: (scroller: InfiniteScroller) => void, initCall = false) {
    if (initCall) callback(this);
    this.onScrollCBs.push(callback);
    return this;
  }

  private _onScroll() {
    this.onScrollCBs.forEach((cb) => {
      cb(this);
    });
  }

  generatorConsumer = async () => {
    if (!this.enabled) return false;
    const { value: { url, offset } = {}, done } = await this.paginationGenerator.next();
    if (!done) {
      const nextPageHTML = await fetchHtml(url);
      const prevScrollPos = document.documentElement.scrollTop;
      this.paginationOffset = offset;
      this.parseData(nextPageHTML);
      this._onScroll();
      window.scrollTo(0, prevScrollPos);
      if (this.writeHistory) {
        history.replaceState({}, '', url);
      }
    }
    return !done;
  };

  static *createPaginationGenerator(
    currentPage: number,
    totalPages: number,
    generateURL: (offset: number) => string,
  ): OffsetGenerator {
    for (let offset = currentPage + 1; offset <= totalPages; offset++) {
      const url = generateURL(offset);
      yield { url, offset };
    }
  }
}
