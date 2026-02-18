### _daddy told us not to be ashamed of our utils_
![](https://i.imgur.com/wwfRj0R.jpeg)

## Installation

```shell
npm i billy-herrington-utils
```
```html
<script src="https://unpkg.com/billy-herrington-utils/dist/billy-herrington-utils.umd.js"></script>
<script>
  const { Tick } = window.bhutils;
</script>
```

## 📦 Arrays & Iterables

### chunks

Splits an array into smaller arrays of a specified size.

* **Input**: `arr: T[]`, `size: number`
* **Output**: `T[][]`

```typescript
const data = [1, 2, 3, 4, 5]
const result = chunks(data, 2)
console.log(result)

```

### range

Generates an array of numbers starting from a specific value.

* **Input**: `size: number`, `start?: number` (default 1), `step?: number` (default 1)
* **Output**: `number[]`

```typescript
const numbers = range(5, 0, 10)
console.log(numbers)

```

### circularShift

Performs a circular shift on a number within a specific capacity.

* **Input**: `n: number` (current index), `c?: number` (capacity, default 6), `s?: number` (shift step, default 1)
* **Output**: `number`

```typescript
const nextIndex = circularShift(5, 6, 1)
console.log(nextIndex)

```

---

## ⏱️ Async & Timing

### wait

Returns a Promise that resolves after a specified duration.

* **Input**: `milliseconds: number`
* **Output**: `Promise<void>`

```typescript
await wait(1000)
console.log("Done waiting")

```

### Tick

A class for creating repeating intervals with start/stop control and final callbacks.

* **Methods**: `start(callback, callbackFinal?)`, `stop()`

```typescript
const ticker = new Tick(1000)
ticker.start(
  () => console.log("Tick"),
  () => console.log("Stopped")
)
await wait(3000)
ticker.stop()

```

---

## 📝 String & Formatting

### splitWith

Splits a string by a delimiter, trims whitespace, and filters out empty strings.

* **Input**: `s: string`, `c?: string` (delimiter, default ",")
* **Output**: `string[]`

```typescript
const tags = splitWith(" apple, banana , , orange ")
console.log(tags)

```

### sanitizeStr

Removes newlines, tabs, and excessive whitespace from a string.

* **Input**: `s: string`
* **Output**: `string`

```typescript
const raw = "  Hello \n\t  World  "
const clean = sanitizeStr(raw)
console.log(clean)

```

### timeToSeconds

Converts a time string (e.g., "1h 30min" or "01:30:00") into total seconds.

* **Input**: `timeStr: string`
* **Output**: `number`

```typescript
const totalSeconds = timeToSeconds("1h 2min 30sec")

```

### formatTimeToHHMMSS

Formats a descriptive time string into a standard HH:MM:SS format.

* **Input**: `timeStr: string`
* **Output**: `string`

```typescript
const stamp = formatTimeToHHMMSS("1h 5min")
console.log(stamp)

```

---

## 🕸️ Network

### fetchWith

A wrapper around the native `fetch` API that supports a mobile User-Agent spoofing and automatic response parsing.

* **Input**: `input: string`, `options: { type?: 'json' | 'html' | 'text', mobile?: boolean, init?: RequestInit }`
* **Output**: `Promise<any>`

```typescript
const data = await fetchWith("https://api.example.com/data", {
  type: "json",
  mobile: true
})

```

### fetchHtml / fetchJson / fetchText

Shorthand functions for `fetchWith` with specific return types.

* **Input**: `input: string`
* **Output**: `Promise<HTMLElement | object | string>`

```typescript
const doc = await fetchHtml("https://example.com")
const json = await fetchJson("https://api.example.com")

```

---

## 🌲 DOM Manipulation

### parseHtml

Parses a raw HTML string and returns a DOM element (or body if multiple children exist).

* **Input**: `html: string`
* **Output**: `HTMLElement`

```typescript
const element = parseHtml("<div><span>Hello</span></div>")
document.body.append(element)

```

### querySelectorLast

Selects the last element matching a selector within a root.

* **Input**: `root?: ParentNode`, `selector: string`
* **Output**: `Element | undefined`

```typescript
const lastItem = querySelectorLast(document, ".list-item")

```

### querySelectorText

Safely extracts and sanitizes the inner text of an element matching the selector.

* **Input**: `e: Element`, `selector: string`
* **Output**: `string`

```typescript
const title = querySelectorText(document.body, "h1.main-title")

```

### replaceElementTag

Replaces an existing DOM element with a new element of a different tag name, preserving attributes and content.

* **Input**: `e: Element`, `tagName: string`
* **Output**: `Element` (the new element)

```typescript
const oldDiv = document.querySelector("#container")
const newSection = replaceElementTag(oldDiv, "section")

```

### instantiateTemplate

Creates a DOM element from a selector, updating specific attributes and text content during cloning.

* **Input**: `sourceSelector: string`, `attributeUpdates: object`, `contentUpdates: object`
* **Output**: `string` (innerHTML of the wrapper)

```typescript
const html = instantiateTemplate(
  "#card-template",
  { "data-id": "123" },
  { ".card-title": "New Item" }
)

```

---

## 👁️ DOM Observers

### waitForElementToAppear

Watches the DOM until an element matching the selector appears, then executes a callback.

* **Input**: `parent: Node`, `selector: string`, `callback: (el: Element) => void`
* **Output**: `MutationObserver`

```typescript
waitForElementToAppear(document.body, ".modal-popup", (modal) => {
  console.log("Modal is ready", modal)
})

```

### waitForElementToDisappear

Watches an element and triggers a callback when it is removed from the DOM.

* **Input**: `observable: Element`, `callback: () => void`
* **Output**: `MutationObserver`

```typescript
const loadingSpinner = document.querySelector("#spinner")
waitForElementToDisappear(loadingSpinner, () => {
  console.log("Loading finished")
})

```

### watchDomChangesWithThrottle

Observes DOM changes and executes a callback with a throttle (rate limit).

* **Input**: `element: Node`, `callback: () => void`, `throttle?: number`
* **Output**: `MutationObserver`

```typescript
watchDomChangesWithThrottle(document.body, () => {
  console.log("DOM changed")
}, 500)

```

---

## 🧬 Objects & Logic

### memoize

Creates a function that caches the result of calls with identical arguments.

* **Input**: `fn: Function`
* **Output**: `Function`

```typescript
const heavyCalc = (x) => x * x
const cachedCalc = memoize(heavyCalc)
cachedCalc(5)
cachedCalc(5)

```

### propsDifference

Compares two objects and returns the property names that are unique to each.

* **Input**: `obj1: object`, `obj2: object`
* **Output**: `{ d1: string[], d2: string[] }`

```typescript
const diff = propsDifference({ a: 1, b: 2 }, { b: 3, c: 4 })
console.log(diff)

```

### objectToFormData

Converts a plain JavaScript object into a `FormData` object.

* **Input**: `obj: Record<string, any>`
* **Output**: `FormData`

```typescript
const form = objectToFormData({ username: "admin", file: blob })

```

---

## 🛠️ Specialized Classes

### RegexFilter

A utility to compile and test strings against complex filter queries (supports OR logic, full-word search, and regex prefixes).

* **Usage**: Create with a query string, then use `hasEvery` or `hasNone`.

```typescript
const filter = new RegexFilter("dog, cat, f:bird")
const isMatch = filter.hasEvery("I have a dog and a bird")

```

### OnHover

Handles complex hover interactions, including tracking when the pointer leaves a specific subject.

* **Usage**: Instantiate with a container and a subject selector.

```typescript
OnHover.create(
  document.body,
  (el) => el.classList.contains("tooltip-target"),
  (target) => {
    console.log("Hovering", target)
    return {
      onOverCallback: () => console.log("Finally block")
    }
  }
)

```

### LazyImgLoader

Manages lazy loading of images by observing intersection and swapping data attributes for source URLs.

* **Usage**: Use `lazify` to setup an image and `delazify` to load it immediately.

```typescript
const loader = new LazyImgLoader((target) => true)
const img = document.querySelector("img")
loader.lazify(img, "https://example.com/image.jpg")

```