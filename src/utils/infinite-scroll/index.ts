import { fetchHtml } from '../fetch';
import { Observer } from '../observers';

interface IURL_DATA {
  offset: number;
  generateURL: (offset: number) => string;
}

interface State {
  infiniteScrollEnabled: boolean;
}

interface StateLocale {
  pagIndexLast: number;
  pagIndexCur: number;
}

interface Rules {
  PAGINATION: HTMLElement;
  PAGINATION_LAST: number;
  INTERSECTION_OBSERVABLE?: HTMLElement;
  URL_DATA: () => IURL_DATA;
}

interface IInfiniteScroller {
  state: State;
  stateLocale: StateLocale;
  rules: Rules;
  delay: number;
  handleHtmlCallback: (document: HTMLElement) => void;
  alternativeGenerator: () => OffsetGenerator;
}

interface GeneratorResult {
  url: string;
  offset: number;
}

type OffsetGenerator = Generator<GeneratorResult> | AsyncGenerator<GeneratorResult>;

export class InfiniteScroller {
  public paginationGenerator: OffsetGenerator;
  public stateLocale: StateLocale;
  public state: State;
  public rules: Rules;
  public delay: number;
  private handleHtmlCallback: (document: HTMLElement) => void;

  constructor({
    state,
    stateLocale,
    rules,
    handleHtmlCallback,
    delay,
    alternativeGenerator,
  }: IInfiniteScroller) {
    this.state = state;
    this.stateLocale = stateLocale;
    this.rules = rules;
    this.delay = delay;
    this.handleHtmlCallback = handleHtmlCallback;

    const { offset, generateURL } = rules.URL_DATA();

    this.stateLocale.pagIndexLast = rules.PAGINATION_LAST;
    this.stateLocale.pagIndexCur = offset;

    this.paginationGenerator =
      alternativeGenerator?.() ??
      InfiniteScroller.createPaginationGenerator(offset, rules.PAGINATION_LAST, generateURL);

    this.createPaginationObserver();
  }

  createPaginationObserver() {
    const observable = this.rules.INTERSECTION_OBSERVABLE || this.rules.PAGINATION;
    Observer.observeWhile(observable, this.generatorConsumer, this.delay);
  }

  generatorConsumer = async () => {
    if (!this.state.infiniteScrollEnabled) return false;
    const {
      value: { url, offset } = {},
      done,
    } = await this.paginationGenerator.next();
    if (!done) {
      const nextPageHTML = await fetchHtml(url);
      const prevScrollPos = document.documentElement.scrollTop;
      this.handleHtmlCallback(nextPageHTML);
      this.stateLocale.pagIndexCur = offset;
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
