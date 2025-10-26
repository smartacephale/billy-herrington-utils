import { LazyImgLoader } from '../../utils/observers';
import { stringToWords } from '../../utils/strings';

interface DataFilterState {
  filterPublic: boolean;
  filterPrivate: boolean;
  filterHD: boolean;
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
  public filters: { [key: string]: () => FilterFunction };

  constructor(
    private rules: IRules,
    private state: DataFilterState,
  ) {
    this.state = state;

    const methods = Object.getOwnPropertyNames(this);
    this.filters = methods.reduce((acc: { [key: string]: () => FilterFunction }, k) => {
      if (k in this.state) {
        acc[k] = this[k as keyof DataFilter] as unknown as () => FilterFunction;
        GM_addStyle(`.filter-${k.toLowerCase().slice(6)} { display: none !important; }`);
      }
      return acc;
    }, {});
  }

  filterPublic = (): FilterFunction => {
    return (v: FilterInput) => {
      const isPublic = !this.rules.isPrivate(v.element as HTMLElement);
      return {
        condition: this.state.filterPublic && isPublic,
        tag: 'filter-public',
      };
    };
  };

  filterPrivate = (): FilterFunction => {
    return (v: FilterInput) => {
      const isPrivate = this.rules.isPrivate(v.element as HTMLElement);
      return {
        condition: this.state.filterPrivate && isPrivate,
        tag: 'filter-private',
      };
    };
  };

  filterHD = (): FilterFunction => {
    return (v: FilterInput) => {
      const isHD = this.rules.isHD(v.element as HTMLElement);
      return {
        condition: this.state.filterHD && isHD,
        tag: 'filter-hd',
      };
    };
  };

  filterDuration = (): FilterFunction => {
    return (v: FilterInput) => {
      const notInRange =
        (v.duration as number) < this.state.filterDurationFrom ||
        (v.duration as number) > this.state.filterDurationTo;
      return {
        condition: this.state.filterDuration && notInRange,
        tag: 'filter-duration',
      };
    };
  };

  filterExclude = (): FilterFunction => {
    const tags = DataManager.filterDSLToRegex(this.state.filterExcludeWords);
    return (v: FilterInput) => {
      const containTags = tags.some((tag) => tag.test(v.title as string));
      return {
        condition: this.state.filterExclude && containTags,
        tag: 'filter-exclude',
      };
    };
  };

  filterInclude = (): FilterFunction => {
    const tags = DataManager.filterDSLToRegex(this.state.filterIncludeWords);
    return (v: FilterInput) => {
      const containTagsNot = tags.some((tag) => !tag.test(v.title as string));
      return {
        condition: this.state.filterInclude && containTagsNot,
        tag: 'filter-include',
      };
    };
  };
}

interface IRules {
  getThumbs: (html: HTMLElement) => HTMLElement[];
  getThumbUrl: (thumbElement: HTMLElement) => string;
  getThumbData: (thumbElement: HTMLElement) => { title: string; duration: number };
  getThumbImgData: (thumbElement: HTMLElement) => { img: HTMLElement; imgSrc: string };
  container: HTMLElement;
  isPrivate: (element: HTMLElement) => boolean;
  isHD: (element: HTMLElement) => boolean;
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

    const targets = [window, (globalThis as any).unsafeWindow].filter(Boolean);
    targets.forEach((w: any) => {
      Object.assign(w, {
        sortByDuration: () => this.sort('duration'),
        sortByViews: () => this.sort('view'),
      });
    });
  }

  static filterDSLToRegex(str: string): RegExp[] {
    const toFullWord = (w: string) => `(^|\\ )${w}($|\\ )`;
    const str_ = str.replace(/f:(\w+)/g, (_, w) => toFullWord(w));
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
      updates.forEach((update) => {
        update();
      });
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

  parseData = (
    html: HTMLElement,
    container?: HTMLElement,
    removeDuplicates = false,
    shouldLazify = true,
  ): void => {
    const thumbs = this.rules.getThumbs(html);
    const data_offset = this.data.size;

    for (const thumbElement of thumbs) {
      const url = this.rules.getThumbUrl(thumbElement);
      if (!url || this.data.has(url)) {
        if (removeDuplicates) thumbElement.remove();
        continue;
      }

      const data = this.rules.getThumbData(thumbElement);
      this.data.set(url, { element: thumbElement, ...data });

      if (shouldLazify) {
        const { img, imgSrc } = this.rules.getThumbImgData(thumbElement);
        this.lazyImgLoader.lazify(thumbElement, img as HTMLImageElement, imgSrc);
      }

      const parent = container || this.rules.container;
      if (!parent.contains(thumbElement)) parent.appendChild(thumbElement);
    }

    this.filterAll(data_offset);
  };

  sort(propName: string) {
    if (this.data.size < 2) return;

    const sorted = Array.from(this.data.keys()).sort((b, a) => {
      return (
        ((this.data.get(a) as FilterInput)[propName] as number) -
        ((this.data.get(b) as FilterInput)[propName] as number)
      );
    });

    const container = ((this.data.get(sorted[0]) as FilterInput).element as HTMLElement)
      .parentElement as HTMLElement;

    sorted.forEach((s) => {
      const e = (this.data.get(s) as FilterInput).element as HTMLElement;
      container.append(e);
    });
  }
}
