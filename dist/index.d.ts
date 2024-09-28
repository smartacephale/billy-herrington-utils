export declare class AsyncPool {
    private max;
    private pool;
    cur: number;
    private finished;
    private _resolve?;
    constructor(max?: number, pool?: Array<SyncPoolObject>);
    getHighPriorityFirst(p?: number): (() => Promise<void>) | undefined;
    runTask(): Promise<void>;
    runTasks(): void;
    run(): Promise<boolean>;
    push(x: SyncPoolObject | (() => Promise<void>)): void;
}

export declare function chunks<T>(arr: Array<T>, n: number): Array<Array<T>>;

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function computeAsyncOneAtTime(iterable: Iterable<() => Promise<void>>): Promise<void[]>;

export declare function copyAttributes(target: HTMLElement | Element, source: HTMLElement | Element): void;

export declare function downloader(options?: {
    append: string;
    after: string;
    button: string;
    cbBefore: () => void;
}): void;

export declare const fetchHtml: (url: string) => Promise<string | HTMLElement>;

export declare const fetchText: (url: string) => Promise<string | HTMLElement>;

export declare function fetchWith(url: string, options?: Record<string, boolean>): Promise<string | HTMLElement>;

export declare function findNextSibling(el: HTMLElement | Element): Element | null;

export declare function getAllUniqueParents(elements: HTMLCollection): Array<HTMLElement | Element>;

export declare function isMob(): boolean;

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

export declare function parseCSSUrl(s: string): string;

export declare function parseDataParams(str: string): any;

export declare function parseDom(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function range(size: number, startAt?: number): Array<number>;

export declare function replaceElementTag(e: HTMLElement | Element, tagName: string): HTMLElement;

export declare function sanitizeStr(s: string): string;

export declare function stringToWords(s: string): Array<string>;

declare interface SyncPoolObject {
    v: () => Promise<void>;
    p: number;
}

export declare class Tick {
    private delay;
    private startImmediate;
    private tick;
    private callbackFinal;
    constructor(delay: number, startImmediate?: boolean);
    start(callback: () => void, callbackFinal?: undefined): void;
    stop(): void;
}

export declare function timeToSeconds(t: string): number;

export declare function wait(milliseconds: number): Promise<unknown>;

export declare function waitForElementExists(parent: HTMLElement | Element, selector: string, callback: (el: Element) => void): void;

export declare function watchDomChangesWithThrottle(element: HTMLElement | Element, callback: () => void, throttle?: number, options?: Record<string, boolean>): void;

export declare function watchElementChildrenCount(element: HTMLElement | Element, callback: (observer: MutationObserver, count: number) => void): void;

export { }
