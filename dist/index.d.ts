export declare class AsyncPool {
    private max;
    private pool;
    private cur;
    private finished;
    private _resolve?;
    static doNAsyncAtOnce(max?: number, pool?: Array<AsyncPoolTask | (() => Promise<void>)>): Promise<boolean>;
    constructor(max?: number, pool?: Array<AsyncPoolTask>);
    private getHighPriorityFirst;
    private runTask;
    private runTasks;
    run(): Promise<boolean>;
    push(x: AsyncPoolTask | (() => Promise<void>)): void;
}

declare interface AsyncPoolTask {
    v: () => Promise<void>;
    p: number;
}

export declare function chunks<T>(arr: Array<T>, n: number): Array<Array<T>>;

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function computeAsyncOneAtTime(iterable: Iterable<() => Promise<void>>): Promise<void[]>;

export declare function copyAttributes(target: HTMLElement | Element, source: HTMLElement | Element): void;

export declare function createInfiniteScroller(store: JabroniStore, handleHtmlCallback: (document: HTMLElement) => void, rules: RulesHelper): InfiniteScroller;

declare interface DataFilterState {
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

export declare class DataManager {
    private rules;
    private state;
    private data;
    private lazyImgLoader;
    dataFilters: {
        [key: string]: () => FilterFunction;
    };
    constructor(rules: IRules, state: DataFilterState);
    static filterDSLToRegex(str: string): RegExp[];
    isFiltered(el: HTMLElement): boolean;
    applyFilters: (filters: {
        [key: string]: boolean;
    }, offset?: number) => void;
    filterAll: (offset?: number) => void;
    handleLoadedHTML: (html: HTMLElement, container?: HTMLElement, removeDuplicates?: boolean, shouldLazify?: boolean) => void;
}

export declare function downloader(options?: {
    append: string;
    after: string;
    button: string;
    cbBefore: () => void;
}): void;

export declare const fetchHtml: (url: string) => Promise<HTMLElement>;

export declare const fetchText: (url: string) => Promise<string>;

export declare function fetchWith(url: string, options?: Record<string, boolean>): Promise<string | HTMLElement>;

declare type FilterFunction = (v: FilterInput) => FilterResult;

declare type FilterInput = Record<string, string | number | boolean | HTMLElement>;

declare interface FilterResult {
    tag: string;
    condition: boolean;
}

export declare function findNextSibling(el: HTMLElement | Element): Element | null;

declare interface GeneratorResult {
    url: string;
    offset: number;
}

export declare function getAllUniqueParents(elements: HTMLCollection): Array<HTMLElement | Element>;

declare interface IInfiniteScroller {
    delay: number;
    enabled: boolean;
    writeHistory?: boolean;
    paginationOffset: number;
    paginationLast: number;
    paginationElement: HTMLElement;
    paginationUrlGenerator: (offset: number) => string;
    handleHtmlCallback: (document: HTMLElement) => void;
    intersectionObservable?: HTMLElement;
    alternativeGenerator?: () => OffsetGenerator;
}

export declare class InfiniteScroller {
    paginationGenerator: OffsetGenerator;
    enabled: boolean;
    delay: number;
    paginationOffset: number;
    paginationLast: number;
    writeHistory: boolean;
    private handleHtmlCallback;
    constructor({ enabled, delay, writeHistory, paginationOffset, paginationLast, paginationElement, paginationUrlGenerator, handleHtmlCallback, alternativeGenerator, intersectionObservable, }: IInfiniteScroller);
    private onScrollCBs;
    onScroll(callback: (scroller: InfiniteScroller) => void, initCall?: boolean): this;
    private _onScroll;
    generatorConsumer: () => Promise<boolean>;
    static createPaginationGenerator(currentPage: number, totalPages: number, generateURL: (offset: number) => string): OffsetGenerator;
}

declare interface IRules {
    GET_THUMBS: (html: HTMLElement) => HTMLElement[];
    THUMB_URL: (thumbElement: HTMLElement) => string;
    THUMB_DATA: (thumbElement: HTMLElement) => {
        title: string;
        duration: number;
    };
    THUMB_IMG_DATA: (thumbElement: HTMLElement) => {
        img: HTMLElement;
        imgSrc: string;
    };
    CONTAINER: HTMLElement;
    IS_PRIVATE: (element: HTMLElement) => boolean;
}

export declare interface IRulesHelper {
    delay?: number;
    IS_VIDEO_PAGE: boolean | RegExp;
    IS_SEARCH_PAGE: boolean | RegExp;
    THUMB_URL: string | ((thumb: HTMLElement) => string);
    GET_THUMBS: string | ((html: HTMLElement) => Array<HTMLElement>);
    THUMB_DATA: {
        title: string;
        uploader?: string;
        duration?: string;
    } | ((thumb: HTMLElement) => {
        title: string;
        duration: number;
    });
    THUMB_IMG_DATA: {
        img?: string;
        imgSrc?: string;
        lazyloading?: string;
    } | ((thumb: HTMLElement) => {
        img?: HTMLElement;
        imgSrc?: string;
    });
    paginationUrlGenerator: ((offset: number) => string) | {
        searchPage?: string;
        pathnameLast?: boolean;
    };
    paginationElement: string | ((html?: HTMLElement) => HTMLElement);
    paginationOffset: number;
    paginationLast: number;
    CONTAINER: string | ((html?: HTMLElement) => HTMLElement);
    router?: (rules: RulesHelper, store: JabroniStore, handleHtmlCallback: (document: HTMLElement) => void, scroller: InfiniteScroller) => void;
    URL_DATA?: () => {
        paginationOffset: number;
        paginationUrlGenerator: (offset: number) => string;
    };
}

export declare function isMob(): boolean;

declare interface JabroniStore {
    state: Record<string, boolean | string | number>;
    localState: Record<string, boolean | string | number>;
    subscribe: (callback: () => void) => void;
}

export declare class LazyImgLoader {
    lazyImgObserver: Observer;
    private attributeName;
    constructor(shouldDelazify: (target: Element) => boolean);
    lazify(_target: Element, img: HTMLImageElement, imgSrc: string): void;
    delazify: (target: HTMLImageElement) => void;
}

export declare function listenEvents(dom: HTMLElement | Element, events: Array<string>, callback: (e: Event) => void): void;

export declare const MOBILE_UA: string;

export declare function objectToFormData(object: Record<string, number | boolean | string>): FormData;

export declare class Observer {
    private callback;
    observer: IntersectionObserver;
    constructor(callback: (entry: Element) => void);
    observe(target: Element): void;
    throttle(target: Element, throttleTime: number): void;
    handleIntersection(entries: Iterable<IntersectionObserverEntry>): void;
    static observeWhile(target: Element, callback: () => Promise<boolean> | boolean, throttleTime: number): Observer;
}

declare type OffsetGenerator = Generator<GeneratorResult> | AsyncGenerator<GeneratorResult>;

export declare function parseCSSUrl(s: string): string;

export declare function parseDataParams(str: string): Record<string, string>;

export declare function parseDom(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function range(size: number, startAt?: number, step?: number): number[];

export declare function replaceElementTag(e: HTMLElement | Element, tagName: string): HTMLElement;

export declare class RulesHelper {
    private options;
    delay: number;
    IS_VIDEO_PAGE: boolean;
    IS_SEARCH_PAGE: boolean;
    paginationElement: HTMLElement;
    paginationOffset: number;
    paginationLast: number;
    URL_DATA: undefined | (() => {
        paginationOffset: number;
        paginationUrlGenerator: (offset: number) => string;
    });
    constructor(options: IRulesHelper);
    router(store: JabroniStore, handleHtmlCallback: (document: HTMLElement) => void): void;
    paginationUrlGenerator: (offset: number) => string;
    _IS_VIDEO_PAGE: () => boolean;
    _IS_SEARCH_PAGE: () => boolean;
    _paginationElement: (html?: Document) => HTMLElement;
    CONTAINER: (html?: Document) => HTMLElement;
    THUMB_URL: (thumb: HTMLElement) => string;
    GET_THUMBS: (html: HTMLElement) => HTMLElement[];
    THUMB_DATA: (thumb: HTMLElement) => {
        title: string;
        duration: number;
    };
    THUMB_IMG_DATA: (thumb: HTMLElement) => {
        img?: HTMLElement;
        imgSrc?: string;
    } | undefined;
}

export declare function sanitizeStr(s: string): string;

export declare function stringToWords(s: string): Array<string>;

export declare class Tick {
    private delay;
    private startImmediate;
    private tick?;
    private callbackFinal?;
    constructor(delay: number, startImmediate?: boolean);
    start(callback: () => void, callbackFinal?: () => void): void;
    stop(): void;
}

export declare function timeToSeconds(t: string): number;

export declare function wait(milliseconds: number): Promise<unknown>;

export declare function waitForElementExists(parent: HTMLElement | Element, selector: string, callback: (el: Element) => void): void;

export declare function watchDomChangesWithThrottle(element: HTMLElement | Element, callback: () => void, throttle?: number, times?: number, options?: Record<string, boolean>): MutationObserver;

export declare function watchElementChildrenCount(element: HTMLElement | Element, callback: (observer: MutationObserver, count: number) => void): void;

export { }
