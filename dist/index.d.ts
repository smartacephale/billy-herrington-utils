export declare function chunks<T>(arr: Array<T>, n: number): Array<Array<T>>;

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function computeAsyncOneAtTime(iterable: Iterable<any>): Promise<any[]>;

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
    private attributeName;
    private removeTagAfter;
    lazyImgObserver: Observer;
    constructor(callback: any, attributeName?: string, removeTagAfter?: boolean);
    lazify(_target: Element, img: HTMLImageElement, imgSrc: string): void;
    delazify: (target: HTMLImageElement) => void;
    static create(callback: any): LazyImgLoader;
}

export declare function listenEvents(dom: HTMLElement | Element, events: Array<string>, callback: any): void;

export declare const MOBILE_UA: string;

export declare function objectToFormData(object: Record<string, number | boolean | string>): FormData;

export declare class Observer {
    private callback;
    observer: IntersectionObserver;
    constructor(callback: (entry: Element) => void);
    observe(target: Element): void;
    throttle(target: Element, throttleTime: number): void;
    handleIntersection(entries: Iterable<IntersectionObserverEntry>): void;
    static observeWhile(target: Element, callback: any, throttleTime: number): Observer;
}

export declare function parseCSSUrl(s: string): string;

export declare function parseDataParams(str: string): any;

export declare function parseDom(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function range(size: number, startAt?: number): Array<number>;

export declare function replaceElementTag(e: HTMLElement | Element, tagName: string): HTMLElement;

export declare function sanitizeStr(s: string): string;

export declare function stringToWords(s: string): Array<string>;

export declare class SyncPull {
    pull: Array<any>;
    lock: boolean;
    getHighPriorityFirst(p?: number): any;
    pullGenerator(): Generator<any, void, unknown>;
    processPull(): Promise<void>;
    push(x: any): void;
}

export declare class Tick {
    private delay;
    private startImmediate;
    private tick;
    private callbackFinal;
    constructor(delay: number, startImmediate?: boolean);
    start(callback: any, callbackFinal?: null): void;
    stop(): void;
}

export declare function timeToSeconds(t: string): number;

export declare function wait(milliseconds: number): Promise<unknown>;

export declare function waitForElementExists(parent: HTMLElement | Element, selector: string, callback: any): void;

export declare function watchDomChangesWithThrottle(element: HTMLElement | Element, callback: any, throttle?: number, options?: Record<string, boolean>): void;

export declare function watchElementChildrenCount(element: HTMLElement | Element, callback: any): void;

export { }
