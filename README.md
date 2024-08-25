### _daddy told us not to be ashamed of our utils_
![](https://i.imgur.com/wwfRj0R.jpeg)

```
<script src="https://unpkg.com/billy-herrington-utils"></script>
```
```
<script src="https://unpkg.com/billy-herrington-utils/dist/billy-herrington-utils.umd.js"></script>
<script>
  const { Tick } = window.bhutils;
</script>
```
```
npm i billy-herrington-utils
```

**A comprehensive collection of utility 🛠️ functions to make dungeon life easier.**

**Key features:**

* **String manipulation:** Easily parse, sanitize, and convert strings.
* **Time and date:** Work with time and date values effortlessly.
* **DOM manipulation:** Interact with DOM elements like a pro.
* **Networking:** Make HTTP requests and handle data with ease.
* **Miscellaneous:** A variety of other useful functions for common tasks.

## **Documentation**

| Function | Short Explanation | Input Parameters | Example Input/Output or Usage |
|---|---|---|---|
| `stringToWords(s)` | Splits a string into an array of words. | `s: string` | `stringToWords("Hello, world!")` -> `["hello", "world"]` |
| `sanitizeStr(s)` | Sanitizes a string by removing newlines, tabs, and extra spaces. | `s: string` | `sanitizeStr("Hello\nWorld\t")` -> `hello world` |
| `timeToSeconds(timeStr)` | Converts a time string to seconds. | `timeStr: string` | `timeToSeconds("1h30m")` -> `5400` |
| `parseIntegerOr(value, defaultValue)` | Parses a string as an integer. | `value: string`, `defaultValue: number` | `parseIntegerOr("10", 0)` -> `10`, `parseIntegerOr("abc", 0)` -> `0` |
| `parseDataParams(str)` | Parses a string containing data parameters into an object. | `str: string` | `parseDataParams("param1:value1;param2:value2")` -> `{ param1: "value1", param2: "value2" }` |
| `parseCSSUrl(cssUrl)` | Extracts the URL from a CSS `url()` declaration. | `cssUrl: string` | `parseCSSUrl("url('https://example.com/image.jpg')")` -> `https://example.com/image.jpg` |
| `Observer` | A class for observing elements and triggering callbacks when they intersect with the viewport. | N/A | `const observer = new Observer((target) => { console.log(target); }); observer.observe(element);` |
| `LazyImgLoader` | A class for lazy loading images. | N/A | `const lazyLoader = new LazyImgLoader(); lazyLoader.lazify(element, image, imageSrc);` |
| `circularShift(value, max, shift)` | Performs a circular shift on a number. | `value: number`, `max: number = 6`, `shift: number = 1` | `circularShift(5, 10, 2)` -> `7` |
| `parseDom(html)` | Parses HTML into a DOM element. | `html: string` | `const element = parseDom("<div>Hello</div>");` |
| `copyAttributes(target, source)` | Copies attributes from one DOM element to another. | `target: HTMLElement`, `source: HTMLElement` | `copyAttributes(targetElement, sourceElement);` |
| `replaceElementTag(element, tagName)` | Replaces a DOM element with a new element of a different tag. | `element: HTMLElement`, `tagName: string` | `replaceElementTag(element, "span");` |
| `getAllUniqueParents(elements)` | Gets all unique parent elements of a list of elements. | `elements: HTMLElement[]` | `const parents = getAllUniqueParents(elements);` |
| `findNextSibling(element)` | Finds the next sibling element of a given element. | `element: HTMLElement` | `const nextSibling = findNextSibling(element);` |
| `waitForElementExists(parent, selector, callback)` | Waits for an element to exist within a parent element and then calls a callback. | `parent: HTMLElement`, `selector: string`, `callback: (element: HTMLElement) => void` | `waitForElementExists(container, ".target-element", (element) => { ... });` |
| `watchElementChildrenCount(element, callback)` | Watches for changes in the number of children of an element and calls a callback. | `element: HTMLElement`, `callback: (observer: MutationObserver, count: number) => void` | `watchElementChildrenCount(element, (observer, count) => { ... });` |
| `watchDomChangesWithThrottle(element, callback, throttle = 1e3, options = { childList: true, subtree: true, attributes: true })` | Watches for DOM changes within an element and calls a callback with throttling. | `element: HTMLElement`, `callback: (mutationList: MutationRecord[]) => void`, `throttle?: number`, `options?: MutationObserverInit` | `watchDomChangesWithThrottle(element, (mutationList) => { ... });` |
| `downloader(options)` | Creates a download button for a video element. | `options: { button: string, append?: string, after?: string, cbBefore?: () => void }` | `downloader({ button: "#download-button" });` |
| `MOBILE_UA` | A constant containing a mobile user agent string. | N/A | `console.log(MOBILE_UA);` |
| `fetchWith(url, options)` | Fetches data from a URL. | `url: string`, `options: { html?: boolean, mobile?: boolean }` | `fetchWith("https://api.example.com/data", { html: true }).then((html) => { ... });` |
| `fetchHtml(url)` | Fetches HTML from a URL. | `url: string` | `fetchHtml("https://example.com/page.html").then((html) => { ... });` |
| `fetchText(url)` | Fetches text from a URL. | `url: string` | `fetchText("https://example.com/data.txt").then((text) => { ... });` |
| `objectToFormData(object)` | Converts an object to FormData. | `object: object` | `const formData = objectToFormData({ name: "John", age: 30 });` |
| `listenEvents(element, events, callback)` | Adds event listeners to a DOM element. | `element: HTMLElement`, `events: string[]`, `callback: (event: Event) => void` | `listenEvents(element, ["click", "mouseover"], (event) => { ... });` |
| `Tick(delay, startImmediate = true)` | A class for creating interval timers. | `delay: number`, `startImmediate?: boolean` | `const tick = new Tick(1000, false); tick.start(() => { ... });` |
| `isMob()` | Checks if the current device is a mobile device. | N/A | `if (isMob()) { ... }` |
| `computeAsyncOneAtTime(iterable)` | Executes asynchronous functions one at a time. | `iterable: Iterable<() => Promise<any>>` | `computeAsyncOneAtTime(asyncFunctions).then((results) => { ... });` |
| `wait(milliseconds)` | Waits for a given number of milliseconds. | `milliseconds: number` | `await wait(1000);` |
| `SyncPull` | A class for managing asynchronous tasks with priorities. | N/A | `const syncPull = new SyncPull(); syncPull.push(() => { ... });` |
| `chunks(arr, n)` | Splits an array into chunks of a given size. | `arr: Array<any>`, `n: number` | `const chunks = chunks([1, 2, 3, 4, 5], 2);` -> `[[1, 2], [3, 4], [5]]` |
| `range(start, end)` | Creates a range of numbers from `start` to `end` (inclusive). | `start: number`, `end: number` | `const numbers = range(1, 5);` -> `[1, 2, 3, 4, 5]` |
