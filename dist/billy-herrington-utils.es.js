function chunks(arr, size) {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size)
  );
}
function* irange(start = 1, step = 1) {
  for (let i = start; ; i += step) {
    yield i;
  }
}
function range(size, start = 1, step = 1) {
  return irange(start, step).take(size).toArray();
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function splitWith(s, c = ",") {
  return s.split(c).map((s2) => s2.trim()).filter(Boolean);
}
function sanitizeStr(s) {
  return s?.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim() || "";
}

function waitForElementToAppear(parent, selector, callback) {
  const observer = new MutationObserver((_mutations) => {
    const el = parent.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
function waitForElementToDisappear(observable, callback) {
  const observer = new MutationObserver((_mutations) => {
    if (!observable.isConnected) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}
function watchElementChildrenCount(element, callback) {
  let count = element.children.length;
  const observer = new MutationObserver((mutationList, observer2) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (count !== element.children.length) {
          count = element.children.length;
          callback(observer2, count);
        }
      }
    }
  });
  observer.observe(element, { childList: true });
  return observer;
}
function watchDomChangesWithThrottle(element, callback, throttle = 1e3, times = Infinity, options = { childList: true, subtree: true, attributes: true }) {
  let lastMutationTime;
  let timeout;
  let times_ = times;
  const observer = new MutationObserver((_mutationList, _observer) => {
    if (times_ !== Infinity && times_ < 1) {
      observer.disconnect();
      return;
    }
    times_--;
    const now = Date.now();
    if (lastMutationTime && now - lastMutationTime < throttle) {
      timeout && clearTimeout(timeout);
    }
    timeout = window.setTimeout(callback, throttle);
    lastMutationTime = now;
  });
  observer.observe(element, options);
  return observer;
}

function querySelectorLast(root = document, selector) {
  const nodes = root.querySelectorAll(selector);
  return nodes.length > 0 ? nodes[nodes.length - 1] : void 0;
}
function querySelectorLastNumber(selector, e = document) {
  const text = querySelectorText(e, selector);
  return Number(text.match(/\d+/g)?.pop() || 0);
}
function querySelectorText(e, selector) {
  if (typeof selector !== "string") return "";
  const text = e.querySelector(selector)?.innerText || "";
  return sanitizeStr(text);
}
function parseHtml(html) {
  const parsed = new DOMParser().parseFromString(html, "text/html").body;
  if (parsed.children.length > 1) return parsed;
  return parsed.firstElementChild;
}
function copyAttributes(target, source) {
  for (const attr of source.attributes) {
    if (attr.nodeValue) {
      target.setAttribute(attr.nodeName, attr.nodeValue);
    }
  }
}
function replaceElementTag(e, tagName) {
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);
  newTagElement.innerHTML = e.innerHTML;
  e.parentNode?.replaceChild(newTagElement, e);
  return newTagElement;
}
function removeClassesAndDataAttributes(element, keyword) {
  Array.from(element.classList).forEach((className) => {
    if (className.includes(keyword)) {
      element.classList.remove(className);
    }
  });
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith("data-") && attr.name.includes(keyword)) {
      element.removeAttribute(attr.name);
    }
  });
}
function getCommonParents(elements) {
  const parents = Array.from(elements).map((el) => el.parentElement).filter((parent) => parent !== null);
  return [...new Set(parents)];
}
function findNextSibling(e) {
  if (e.nextElementSibling) return e.nextElementSibling;
  if (e.parentElement) return findNextSibling(e.parentElement);
  return null;
}
function checkHomogenity(a, b, options) {
  if (!a || !b) return false;
  if (options.id) {
    if (a.id !== b.id) return false;
  }
  if (options.className) {
    const ca = a.className;
    const cb = b.className;
    if (!(ca.length > cb.length ? ca.includes(cb) : cb.includes(ca))) {
      return false;
    }
  }
  return true;
}
function instantiateTemplate(sourceSelector, attributeUpdates, contentUpdates) {
  const source = document.querySelector(sourceSelector);
  const wrapper = document.createElement("div");
  const clone = source.cloneNode(true);
  wrapper.append(clone);
  Object.entries(attributeUpdates).forEach(([attrName, attrValue]) => {
    wrapper.querySelectorAll(`[${attrName}]`).forEach((element) => {
      element.setAttribute(attrName, attrValue);
    });
  });
  Object.entries(contentUpdates).forEach(([childSelector, textValue]) => {
    wrapper.querySelectorAll(childSelector).forEach((element) => {
      element.innerText = textValue;
    });
  });
  return wrapper.innerHTML;
}
function exterminateVideo(video) {
  video.removeAttribute("src");
  video.load();
  video.remove();
}
function downloader(options = { append: "", after: "", button: "", cbBefore: () => {
} }) {
  const btn = parseHtml(options.button);
  if (options.append) document.querySelector(options.append)?.append(btn);
  if (options.after) document.querySelector(options.after)?.after(btn);
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (options.cbBefore) options.cbBefore();
    waitForElementToAppear(document.body, "video", (video) => {
      window.location.href = video.getAttribute("src");
    });
  });
}

class OnHover {
  constructor(container, subjectSelector, onOver, onLeave) {
    this.container = container;
    this.subjectSelector = subjectSelector;
    this.onOver = onOver;
    this.onLeave = onLeave;
    this.container.addEventListener("pointerover", (e) => this.handleEvent(e));
  }
  handleLeaveEvent() {
    this.onLeave?.(this.target);
    this.onOverFinally?.();
    this.target = void 0;
    this.onOverFinally = void 0;
    this.leaveSubject = void 0;
  }
  handleEvent(e) {
    const currentTarget = e.target;
    if (!this.subjectSelector(currentTarget) || this.target === currentTarget) return;
    this.leaveSubject?.dispatchEvent(new PointerEvent("pointerleave"));
    this.target = currentTarget;
    const result = this.onOver(this.target);
    this.onOverFinally = result?.onOverCallback;
    this.leaveSubject = result?.leaveTarget || this.target;
    this.leaveSubject.addEventListener("pointerleave", (_) => this.handleLeaveEvent(), {
      once: true
    });
  }
  target;
  leaveSubject;
  onOverFinally;
  static create(...args) {
    return new OnHover(...args);
  }
}

class Tick {
  constructor(delay, startImmediate = true) {
    this.delay = delay;
    this.startImmediate = startImmediate;
  }
  tick;
  callbackFinal;
  start(callback, callbackFinal) {
    this.stop();
    this.callbackFinal = callbackFinal;
    if (this.startImmediate) callback();
    this.tick = window.setInterval(callback, this.delay);
  }
  stop() {
    if (this.tick !== void 0) {
      clearInterval(this.tick);
      this.tick = void 0;
    }
    if (this.callbackFinal) {
      this.callbackFinal();
      this.callbackFinal = void 0;
    }
  }
}

const MOBILE_UA = {
  "User-Agent": [
    "Mozilla/5.0 (Linux; Android 10; K)",
    "AppleWebKit/537.36 (KHTML, like Gecko)",
    "Chrome/114.0.0.0 Mobile Safari/537.36"
  ].join(" ")
};
async function fetchWith(input, options) {
  const requestInit = options.init || {};
  if (options.mobile) {
    Object.assign(requestInit, { headers: new Headers(MOBILE_UA) });
  }
  const r = await fetch(input, requestInit).then((r2) => r2);
  if (options.type === "json") return await r.json();
  if (options.type === "html") return parseHtml(await r.text());
  return await r.text();
}
const fetchJson = (input) => fetchWith(input, { type: "json" });
const fetchHtml = (input) => fetchWith(input, { type: "html" });
const fetchText = (input) => fetchWith(input, { type: "text" });

function circularShift(n, c = 6, s = 1) {
  return (n + s) % c || c;
}

function memoize(fn) {
  const cache = /* @__PURE__ */ new Map();
  const memoizedFunction = ((...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  });
  return memoizedFunction;
}

function objectToFormData(obj) {
  const formData = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    formData.append(k, v);
  });
  return formData;
}
function propsDifference(obj1, obj2) {
  const a = new Set(Object.getOwnPropertyNames(obj1));
  const b = new Set(Object.getOwnPropertyNames(obj2));
  const d1 = a.difference(b).values().toArray();
  const d2 = b.difference(a).values().toArray();
  return { d1, d2 };
}

class LazyImgLoader {
  lazyImgObserver;
  attributeName = "data-lazy-load";
  constructor(shouldDelazify) {
    this.lazyImgObserver = new Observer((target) => {
      if (shouldDelazify(target)) {
        this.delazify(target);
      }
    });
  }
  lazify(_target, img, imgSrc) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = "";
    this.lazyImgObserver.observe(img);
  }
  delazify = (target) => {
    this.lazyImgObserver.observer.unobserve(target);
    target.src = target.getAttribute(this.attributeName);
    target.removeAttribute(this.attributeName);
  };
}

class Observer {
  constructor(callback) {
    this.callback = callback;
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  observer;
  timeout;
  observe(target) {
    this.observer.observe(target);
  }
  throttle(target, throttleTime) {
    this.observer.unobserve(target);
    this.timeout = window.setTimeout(() => this.observer.observe(target), throttleTime);
  }
  handleIntersection(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target);
      }
    }
  }
  dispose() {
    if (this.timeout) clearTimeout(this.timeout);
    this.observer.disconnect();
  }
  static observeWhile(target, callback, throttleTime) {
    const observer_ = new Observer(async (target2) => {
      const condition = await callback();
      if (condition) observer_.throttle(target2, throttleTime);
    });
    observer_.observe(target);
    return observer_;
  }
}

function formatTimeToHHMMSS(timeStr) {
  const pad = (num) => num.toString().padStart(2, "0");
  const h = timeStr.match(/(\d+)\s*h/)?.[1] || "0";
  const m = timeStr.match(/(\d+)\s*mi?n/)?.[1] || "0";
  const s = timeStr.match(/(\d+)\s*sec/)?.[1] || "0";
  return `${pad(+h)}:${pad(+m)}:${pad(+s)}`;
}
function timeToSeconds(timeStr) {
  const normalized = /[a-zA-Z]/.test(timeStr) ? formatTimeToHHMMSS(timeStr) : timeStr;
  return normalized.split(":").reverse().reduce((total, unit, index) => total + parseInt(unit, 10) * 60 ** index, 0);
}

function parseIntegerOr(n, or) {
  const num = Number(n);
  return Number.isSafeInteger(num) ? num : or;
}
function parseDataParams(str) {
  const paramsStr = decodeURI(str.trim()).split(";");
  return paramsStr.reduce(
    (acc, s) => {
      const parsed = s.match(/([+\w]+):([\w\- ]+)?/);
      if (parsed) {
        const [, key, value] = parsed;
        if (value) {
          key.split("+").forEach((p) => {
            acc[p] = value;
          });
        }
      }
      return acc;
    },
    {}
  );
}
function parseCssUrl(s) {
  return s.replace(/url\("|"\).*/g, "");
}

class RegexFilter {
  regexes;
  constructor(str, flags = "gi") {
    this.regexes = memoize(this.compileSearchRegex)(str, flags);
  }
  // 'dog,bog,f:girl' or r:dog|bog... => [r/dog/i, r/bog/i, r/(^|\ )girl($|\ )/i]
  compileSearchRegex(str, flags) {
    try {
      if (str.startsWith("r:")) return [new RegExp(str.slice(2), flags)];
      const regexes = splitWith(str).map(
        (s) => s.replace(/f:(\w+)/g, (_, w) => `(^|\\ |,)${w}($|\\ |,)`)
        // full word
      ).map((_) => new RegExp(_, flags));
      return regexes;
    } catch (_) {
      return [];
    }
  }
  hasEvery(str) {
    return this.regexes.every((r) => r.test(str));
  }
  hasNone(str) {
    return this.regexes.every((r) => !r.test(str));
  }
}

export { LazyImgLoader, Observer, OnHover, RegexFilter, Tick, checkHomogenity, chunks, circularShift, copyAttributes, downloader, exterminateVideo, fetchHtml, fetchJson, fetchText, fetchWith, findNextSibling, getCommonParents, instantiateTemplate, memoize, objectToFormData, parseCssUrl, parseDataParams, parseHtml, parseIntegerOr, propsDifference, querySelectorLast, querySelectorLastNumber, querySelectorText, range, removeClassesAndDataAttributes, replaceElementTag, sanitizeStr, splitWith, timeToSeconds, wait, waitForElementToAppear, waitForElementToDisappear, watchDomChangesWithThrottle, watchElementChildrenCount };
//# sourceMappingURL=billy-herrington-utils.es.js.map
