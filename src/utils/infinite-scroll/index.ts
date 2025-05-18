import { fetchHtml } from '../fetch';
import { Observer } from '../observers';

interface IInfiniteScroller {
  delay: number;
  enabled: boolean;
  paginationOffset: number;
  paginationLast: number;
  paginationElement: HTMLElement;
  paginationUrlGenerator: (offset: number) => string;
  handleHtmlCallback: (document: HTMLElement) => void;
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
  private handleHtmlCallback: (document: HTMLElement) => void;

  constructor({
    enabled,
    handleHtmlCallback,
    delay,
    alternativeGenerator,
    paginationOffset,
    paginationLast,
    paginationElement,
    paginationUrlGenerator,
    intersectionObservable,
  }: IInfiniteScroller) {
    this.enabled = enabled;
    this.delay = delay;
    this.paginationOffset = paginationOffset;
    this.paginationLast = paginationLast;
    this.handleHtmlCallback = handleHtmlCallback;

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

  // this.stateLocale.pagIndexLast = paginationLast;
  // this.stateLocale.pagIndexCur = paginationOffset;
  // infiniteScrollEnabled: boolean;

  private onScrollCBs: Array<(scroller: InfiniteScroller) => void> = [];

  public onScroll(callback: (scroller: InfiniteScroller) => void) {
    this.onScrollCBs.push(callback);
    return this;
  }

  private _onScroll() {
    this.onScrollCBs.forEach((cb) => cb(this));
  }

  generatorConsumer = async () => {
    if (!this.enabled) return false;
    const {
      value: { url, offset } = {},
      done,
    } = await this.paginationGenerator.next();
    if (!done) {
      const nextPageHTML = await fetchHtml(url);
      const prevScrollPos = document.documentElement.scrollTop;
      this.paginationOffset = offset;
      this.handleHtmlCallback(nextPageHTML);
      this._onScroll();
      window.scrollTo(0, prevScrollPos);
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
