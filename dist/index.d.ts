declare type AnyFunction = (...args: any[]) => any;

export declare function checkHomogenity<T extends HTMLElement>(a: T, b: T, options: {
    id?: boolean;
    className?: boolean;
}): boolean;

export declare function chunks<T>(arr: T[], size: number): T[][];

export declare function circularShift(n: number, c?: number, s?: number): number;

export declare function copyAttributes<T extends Element = HTMLElement>(target: T, source: T): void;

export declare function downloader(options?: {
    append: string;
    after: string;
    button: string;
    cbBefore: () => void;
}): void;

export declare function exterminateVideo(video: HTMLVideoElement): void;

export declare const fetchHtml: (input: RequestInfo | URL) => Promise<HTMLElement>;

export declare const fetchJson: (input: RequestInfo | URL) => Promise<JSON>;

export declare const fetchText: (input: RequestInfo | URL) => Promise<string>;

export declare function fetchWith<T extends JSON | string | HTMLElement>(input: RequestInfo | URL, options: {
    init?: RequestInit;
    type: 'json' | 'html' | 'text';
    mobile?: boolean;
}): Promise<T>;

export declare function findNextSibling<T extends Element = HTMLElement>(e: T): Element | null;

export declare function getCommonParents(elements: HTMLCollection | HTMLElement[]): HTMLElement[];

export declare function instantiateTemplate(sourceSelector: string, attributeUpdates: Record<string, string>, contentUpdates: Record<string, string>): string;

export declare class LazyImgLoader {
    lazyImgObserver: Observer;
    private attributeName;
    constructor(shouldDelazify: (target: Element) => boolean);
    lazify(_target: Element, img?: HTMLImageElement, imgSrc?: string): void;
    delazify: (target: HTMLImageElement) => void;
}

export declare function memoize<T extends AnyFunction>(fn: T): MemoizedFunction<T>;

declare interface MemoizedFunction<T extends AnyFunction> extends CallableFunction {
    (...args: Parameters<T>): ReturnType<T>;
    clear: () => void;
}

export declare function objectToFormData<T extends {}>(obj: T): FormData;

export declare class Observer {
    private callback;
    observer: IntersectionObserver;
    private timeout?;
    constructor(callback: (entry: Element) => void);
    observe(target: Element): void;
    throttle(target: Element, throttleTime: number): void;
    handleIntersection(entries: Iterable<IntersectionObserverEntry>): void;
    dispose(): void;
    static observeWhile(target: Element, callback: () => Promise<boolean> | boolean, throttleTime: number): Observer;
}

export declare class OnHover {
    private container;
    private subjectSelector;
    private onOver;
    private onLeave?;
    private handleLeaveEvent;
    private handleEvent;
    private target;
    private leaveSubject;
    private onOverFinally;
    constructor(container: HTMLElement, subjectSelector: (target: HTMLElement) => boolean, onOver: (target: HTMLElement) => void | {
        onOverCallback?: () => void;
        leaveTarget?: HTMLElement;
    }, onLeave?: ((target: HTMLElement) => void) | undefined);
    static create(...args: ConstructorParameters<typeof OnHover>): OnHover;
}

export declare function parseCssUrl(s: string): string;

export declare function parseDataParams(str: string): Record<string, string>;

export declare function parseHtml(html: string): HTMLElement;

export declare function parseIntegerOr(n: string | number, or: number): number;

export declare function propsDifference<T extends Record<string, unknown>, U extends object>(obj1: T | U, obj2: T | U): {
    d1: string[];
    d2: string[];
};

export declare function querySelectorLast<T extends Element = HTMLElement>(root: ParentNode | undefined, selector: string): T | undefined;

export declare function querySelectorLastNumber(selector: string, e?: ParentNode): number;

export declare function querySelectorText(e: ParentNode, selector?: string): string;

export declare function range(size: number, start?: number, step?: number): number[];

export declare class RegexFilter {
    private regexes;
    constructor(str: string, flags?: string);
    private compileSearchRegex;
    hasEvery(str: string): boolean;
    hasNone(str: string): boolean;
}

export declare function removeClassesAndDataAttributes(element: HTMLElement, keyword: string): void;

export declare function replaceElementTag(e: HTMLElement, tagName: string): HTMLElement;

export declare function sanitizeStr(s: string): string;

export declare function splitWith(s: string, c?: string): Array<string>;

export declare class Tick {
    private delay;
    private startImmediate;
    private tick?;
    private callbackFinal?;
    constructor(delay: number, startImmediate?: boolean);
    start(callback: () => void, callbackFinal?: () => void): void;
    stop(): void;
}

/**
 * Converts a time string (HH:MM:SS or duration format) to total seconds.
 * @param timeStr - The time string to convert.
 * @returns The total number of seconds.
 */
export declare function timeToSeconds(timeStr: string): number;

export declare function wait(milliseconds: number): Promise<unknown>;

export declare function waitForElementToAppear(parent: ParentNode, selector: string, callback: (el: Element) => void): MutationObserver;

export declare function waitForElementToDisappear(observable: HTMLElement, callback: () => void): MutationObserver;

export declare function watchDomChangesWithThrottle(element: HTMLElement, callback: () => void, throttle?: number, times?: number, options?: MutationObserverInit): MutationObserver;

export declare function watchElementChildrenCount(element: ParentNode, callback: (observer: MutationObserver, count: number) => void): MutationObserver;

export { }
