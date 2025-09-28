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

---

### General Utilities

| Function | Short Explanation | Input Parameters | Example Input/Output or Usage |
|---|---|---|---|
| `stringToWords(s)` | Splits a comma-separated string into an array of lowercase, trimmed words. | `s: string` | `stringToWords("Hello, world!, Test_String")` -> `["hello", "world", "test_string"]` |
| `sanitizeStr(s)` | Cleans up a string by removing newlines/tabs, excess spaces, and converting to lowercase. | `s: string` | `sanitizeStr("  Hello  \nWorld  ")` -> `"hello world"` |
| `formatTimeToHHMMSS(timeString)` | Formats a time string (e.g., "1h 30min 15sec") into "HH:MM:SS". | `timeString: string` | `formatTimeToHHMMSS("1h 2min")` -> `"01:02:00"` |
| `timeToSeconds(t)` | Converts a time string (e.g., "1h 30min") or "HH:MM:SS" into total seconds. | `t: string` | `timeToSeconds("1h 2min")` -> `3720` |
| `parseIntegerOr(n, or)` | Parses a string into an integer, returning a default value if parsing fails. | `n: any`, `or: number` | `parseIntegerOr("100", 0)` -> `100`, `parseIntegerOr("abc", 0)` -> `0` |
| `parseDataParams(str)` | Parses a string of key-value pairs (`key:value;`) into an object. | `str: string` | `parseDataParams("user:john;id:123")` -> `{user: "john", id: "123"}` |
| `parseCSSUrl(s)` | Extracts the URL from a CSS `url()` string. | `s: string` | `parseCSSUrl("url(\"https://example.com/img.png\")")` -> `"https://example.com/img.png"` |
| `circularShift(n, c = 6, s = 1)` | Performs a circular shift on a number within a range. | `n: number`, `c: number`, `s: number` | `circularShift(5, 6, 1)` -> `6` |
| `range(size, startAt = 1, step = 1)` | Creates an array of numbers in a specified range. | `size: number`, `startAt: number`, `step: number` | `range(3, 2, 2)` -> `[2, 4, 6]` |
| `chunks(arr, n)` | Splits an array into chunks of a given size. | `arr: Array`, `n: number` | `chunks([1, 2, 3, 4, 5], 2)` -> `[[1, 2], [3, 4], [5]]` |
| `isMob()` | Checks if the user agent indicates a mobile device. | N/A | `isMob()` -> `true` or `false` |
| `wait(milliseconds)` | Returns a Promise that resolves after a delay. | `milliseconds: number` | `await wait(1000)` waits for 1 second. |
| `computeAsyncOneAtTime(iterable)` | Executes an iterable of async functions one at a time. | `iterable: Iterable<Function>` | `await computeAsyncOneAtTime([() => fetch('a'), () => fetch('b')])` |
| `objectToFormData(object)` | Converts a JavaScript object into a `FormData` object. | `object: object` | `objectToFormData({ key: 'value' })` -> `FormData` object |

---

### DOM Manipulation

| Function | Short Explanation | Input Parameters | Example Input/Output or Usage |
|---|---|---|---|
| `parseDom(html)` | Parses an HTML string into a DOM element. | `html: string` | `parseDom("<div>Hello</div>")` -> `HTMLDivElement` |
| `copyAttributes(target, source)` | Copies all attributes from one element to another. | `target: HTMLElement`, `source: HTMLElement` | `copyAttributes(div1, div2)` |
| `replaceElementTag(e, tagName)` | Replaces an element's tag while preserving its content and attributes. | `e: HTMLElement`, `tagName: string` | `replaceElementTag(document.querySelector('p'), 'div')` |
| `getAllUniqueParents(elements)` | Returns an array of unique parent elements. | `elements: Array<HTMLElement>` | `getAllUniqueParents([el1, el2])` |
| `findNextSibling(el)` | Finds the next sibling, or recursively checks parent elements. | `el: HTMLElement` | `findNextSibling(document.querySelector('li'))` |
| `waitForElementExists(parent, selector, callback)` | Waits for an element to exist in the DOM and then runs a callback. | `parent: HTMLElement`, `selector: string`, `callback: Function` | `waitForElementExists(document.body, '.my-class', (el) => console.log(el))` |
| `watchElementChildrenCount(element, callback)` | Observes an element for changes in its number of children. | `element: HTMLElement`, `callback: Function` | `watchElementChildrenCount(list, (obs, count) => console.log(count))` |
| `watchDomChangesWithThrottle(element, callback, throttle, times, options)` | Watches for DOM changes with a throttle to prevent excessive callbacks. | `element: HTMLElement`, `callback: Function`, `throttle: number`, `times: number`, `options: object` | `watchDomChangesWithThrottle(body, () => ..., 500)` |
| `downloader(options)` | Creates a button to download a video from the page. | `options: object` | `downloader({ button: '<button>Download</button>', append: 'body' })` |
| `exterminateVideo(video)` | Removes a video element and stops it from loading. | `video: HTMLVideoElement` | `exterminateVideo(document.querySelector('video'))` |
| `listenEvents(dom, events, callback)` | Adds multiple event listeners to a DOM element. | `dom: HTMLElement`, `events: Array<string>`, `callback: Function` | `listenEvents(btn, ['click', 'mouseover'], handler)` |

---

### Network Utilities

| Function | Short Explanation | Input Parameters | Example Input/Output or Usage |
|---|---|---|---|
| `fetchWith(url, options)` | A flexible wrapper for the `fetch` API with options for HTML parsing and mobile user agents. | `url: string`, `options: object` | `fetchWith('https://example.com', { html: true })` |
| `fetchHtml(url)` | Fetches a URL and parses the response as HTML. | `url: string` | `fetchHtml('https://example.com/page.html')` |
| `fetchText(url)` | Fetches a URL and returns the response as plain text. | `url: string` | `fetchText('https://example.com/data.txt')` |

---

### Classes

| Class | Short Explanation | Methods | Usage |
|---|---|---|---|
| `Observer` | A wrapper around the native `IntersectionObserver`. | `observe(target)`, `throttle(target, time)`, `static observeWhile(...)` | `const obs = new Observer(cb); obs.observe(target);` |
| `LazyImgLoader` | Handles lazy-loading images using `IntersectionObserver`. | `lazify(_target, img, imgSrc)`, `delazify(target)` | `const loader = new LazyImgLoader(shouldLoad); loader.lazify(div, img, 'src');` |
| `Tick` | A utility for creating timed intervals. | `start(callback, finalCallback)`, `stop()` | `const ticker = new Tick(1000); ticker.start(() => console.log('tick'), () => console.log('done'));` |
| `AsyncPool` | Manages a pool of asynchronous tasks with a concurrency limit. | `push(task)`, `run()`, `static doNAsyncAtOnce(...)` | `const pool = new AsyncPool(2); pool.push(task1); pool.push(task2); pool.run();` |
| `DataManager` | A class for managing, filtering, and sorting data from a webpage. | `applyFilters(filters, offset)`, `filterAll(offset)`, `parseData(html, container, ...)` | `const dm = new DataManager(rules, state); dm.parseData(html);` |
| `InfiniteScroller` | Implements infinite scrolling by loading new content when the user reaches the end of the page. | `onScroll(callback)`, `_onScroll()` | `const iscroll = new InfiniteScroller({ ...rules });` |
| `RulesHelper` | A helper class for defining website-specific rules. | `router(store, cb)`, `_IS_VIDEO_PAGE()`, `_IS_SEARCH_PAGE()` | `const rules = new RulesHelper(options); rules.router(store, cb);` |
