import { LazyImgLoader } from '../utils/observers';
import { stringToWords } from '../utils/strings';

interface DataFilterState {
  filterPublic: boolean;
  filterPrivate: boolean;
  filterDuration: boolean;
  filterDurationFrom: number;
  filterDurationTo: number;
  filterExclude: boolean;
  filterExcludeWords: string;
  filterInclude: boolean;
  filterIncludeWords: string;
}

interface FilterResult {
  tag: string;
  condition: boolean;
}

type FilterInput = Record<string, string | number | boolean | HTMLElement>;
type FilterFunction = (v: FilterInput) => FilterResult;

class DataFilter {
  private state: DataFilterState;
  private rules: IRules;
  public filters: { [key: string]: () => FilterFunction };

  constructor(rules: IRules, state: DataFilterState) {
    this.state = state;
    this.rules = rules;

    const methods = Object.getOwnPropertyNames(this);
    this.filters = methods.reduce((acc: { [key: string]: () => FilterFunction }, k) => {
      if (k in this.state) {
        acc[k] = this[k as keyof DataFilter] as unknown as () => FilterFunction;
        //@ts-ignore
        GM_addStyle(`.filter-${k.toLowerCase().slice(6)} { display: none !important; }`);
      }
      return acc;
    }, {});
  }

  filterPublic = (): FilterFunction => {
    return (v: FilterInput) => {
      const isPublic = !this.rules.IS_PRIVATE(v.element as HTMLElement);
      return {
        tag: 'filter-public',
        condition: this.state.filterPublic && isPublic,
      };
    };
  };

  filterPrivate = (): FilterFunction => {
    return (v: FilterInput) => {
      const isPrivate = this.rules.IS_PRIVATE(v.element as HTMLElement);
      return {
        tag: 'filter-private',
        condition: this.state.filterPrivate && isPrivate,
      };
    };
  };

  filterDuration = (): FilterFunction => {
    return (v: FilterInput) => {
      const notInRange =
        (v.duration as number) < this.state.filterDurationFrom ||
        (v.duration as number) > this.state.filterDurationTo;
      return {
        tag: 'filter-duration',
        condition: this.state.filterDuration && notInRange,
      };
    };
  };

  filterExclude = (): FilterFunction => {
    const tags = DataManager.filterDSLToRegex(this.state.filterExcludeWords);
    return (v: FilterInput) => {
      const containTags = tags.some((tag) => tag.test(v.title as string));
      return {
        tag: 'filter-exclude',
        condition: this.state.filterExclude && containTags,
      };
    };
  };

  filterInclude = (): FilterFunction => {
    const tags = DataManager.filterDSLToRegex(this.state.filterIncludeWords);
    return (v: FilterInput) => {
      const containTagsNot = tags.some((tag) => !tag.test(v.title as string));
      return {
        tag: 'filter-include',
        condition: this.state.filterInclude && containTagsNot,
      };
    };
  };
}

interface IRules {
  GET_THUMBS: (html: HTMLElement) => HTMLElement[];
  THUMB_URL: (thumbElement: HTMLElement) => string;
  THUMB_DATA: (thumbElement: HTMLElement) => { title: string; duration: number };
  THUMB_IMG_DATA: (thumbElement: HTMLElement) => { img: HTMLElement; imgSrc: string };
  CONTAINER: HTMLElement;
  IS_PRIVATE: (element: HTMLElement) => boolean;
}

export class DataManager {
  private rules: IRules;
  private state: DataFilterState;
  private data: Map<string, FilterInput>;
  private lazyImgLoader: LazyImgLoader;
  public dataFilters: { [key: string]: () => FilterFunction };

  constructor(rules: IRules, state: DataFilterState) {
    this.rules = rules;
    this.state = state;
    this.data = new Map();
    this.lazyImgLoader = new LazyImgLoader(
      (target: Element) => !this.isFiltered(target as HTMLElement),
    );
    this.dataFilters = new DataFilter(rules, state).filters;
  }

  static filterDSLToRegex(str: string): RegExp[] {
    const toFullWord = (w: string) => `(^|\\ )${w}($|\\ )`;
    const str_ = str.replace(/f\:(\w+)/g, (_, w) => toFullWord(w));
    return stringToWords(str_).map((expr: string) => new RegExp(expr, 'i'));
  }

  isFiltered(el: HTMLElement): boolean {
    return el.className.includes('filtered');
  }

  applyFilters = (filters: { [key: string]: boolean }, offset = 0): void => {
    const filtersToApply = Object.keys(filters)
      .filter((k) => Object.hasOwn(this.dataFilters, k))
      .map((k) => this.dataFilters[k]());

    if (filtersToApply.length === 0) return;

    const updates: (() => void)[] = [];
    let offset_counter = 1;
    for (const v of this.data.values()) {
      if (++offset_counter > offset) {
        for (const f of filtersToApply) {
          const { tag, condition } = f(v as FilterInput);
          updates.push(() => (v.element as HTMLElement).classList.toggle(tag, condition));
        }
      }
    }

    requestAnimationFrame(() => {
      updates.forEach((update) => update());
    });
  };

  filterAll = (offset?: number): void => {
    const filters = Object.assign(
      {},
      ...Object.keys(this.dataFilters).map((f) => ({
        [f]: this.state[f as keyof DataFilterState],
      })),
    );
    this.applyFilters(filters, offset);
  };

  handleLoadedHTML = (
    html: HTMLElement,
    container?: HTMLElement,
    removeDuplicates = false,
    shouldLazify = true,
  ): void => {
    const thumbs = this.rules.GET_THUMBS(html);
    const data_offset = this.data.size;

    for (const thumbElement of thumbs) {
      const url = this.rules.THUMB_URL(thumbElement);
      if (!url || this.data.has(url)) {
        if (removeDuplicates) thumbElement.remove();
        continue;
      }

      const { title, duration } = this.rules.THUMB_DATA(thumbElement);
      this.data.set(url, { element: thumbElement, duration, title });

      if (shouldLazify) {
        const { img, imgSrc } = this.rules.THUMB_IMG_DATA(thumbElement);
        this.lazyImgLoader.lazify(thumbElement, img as HTMLImageElement, imgSrc);
      }

      const parent = container || this.rules.CONTAINER;
      if (!parent.contains(thumbElement)) parent.appendChild(thumbElement);
    }

    this.filterAll(data_offset);
  };
}
