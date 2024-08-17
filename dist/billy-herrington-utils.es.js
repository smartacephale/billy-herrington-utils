var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function stringToWords(s) {
  return s.split(",").map((s2) => s2.trim().toLowerCase()).filter((_) => _);
}
function sanitizeStr(s) {
  return (s == null ? void 0 : s.replace(/\n|\t/, " ").replace(/ {2,}/, " ").trim().toLowerCase()) || "";
}
function timeToSeconds(t) {
  return ((t == null ? void 0 : t.match(/\d+/gm)) || [0]).reverse().map((s, i) => parseInt(s) * 60 ** i).reduce((a, b) => a + b);
}
function parseIntegerOr(n, or) {
  return Number.isInteger(parseInt(n)) ? parseInt(n) : or;
}
function parseDataParams(str) {
  const params = str.split(";").flatMap((s) => {
    const parsed = s.match(/([\+\w+]+):(\w+)?/);
    const value = parsed == null ? void 0 : parsed[2];
    if (value) return parsed[1].split("+").map((p) => ({ [p]: value }));
  }).filter((_) => _);
  return Object.assign({}, ...params);
}
function parseCSSUrl(s) {
  return s.replace(/url\("|\"\).*/g, "");
}
class Observer {
  constructor(callback) {
    __publicField(this, "observer");
    this.callback = callback;
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  observe(target) {
    this.observer.observe(target);
  }
  throttle(target, throttleTime) {
    this.observer.unobserve(target);
    setTimeout(() => this.observer.observe(target), throttleTime);
  }
  handleIntersection(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target);
      }
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static observeWhile(target, callback, throttleTime) {
    const observer_ = new Observer(async (target2) => {
      const condition = await callback();
      if (condition) observer_.throttle(target2, throttleTime);
    });
    observer_.observe(target);
    return observer_;
  }
}
class LazyImgLoader {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(callback, attributeName = "data-lazy-load", removeTagAfter = true) {
    __publicField(this, "lazyImgObserver");
    __publicField(this, "delazify", (target) => {
      this.lazyImgObserver.observer.unobserve(target);
      target.src = target.getAttribute(this.attributeName);
      if (this.removeTagAfter) target.removeAttribute(this.attributeName);
    });
    this.attributeName = attributeName;
    this.removeTagAfter = removeTagAfter;
    this.lazyImgObserver = new Observer((target) => {
      callback(target, this.delazify);
    });
  }
  lazify(_target, img, imgSrc) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = "";
    this.lazyImgObserver.observe(img);
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static create(callback) {
    const lazyImgLoader = new LazyImgLoader((target, delazify) => {
      if (callback(target)) {
        delazify(target);
      }
    });
    return lazyImgLoader;
  }
}
function circularShift(n, c = 6, s = 1) {
  return (n + s) % c || c;
}
function parseDom(html) {
  const parsed = new DOMParser().parseFromString(html, "text/html").body;
  return parsed.children.length > 1 ? parsed : parsed.firstElementChild;
}
function copyAttributes(target, source) {
  for (const attr of source.attributes) {
    attr.nodeValue && target.setAttribute(attr.nodeName, attr.nodeValue);
  }
}
function replaceElementTag(e, tagName) {
  var _a;
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);
  newTagElement.innerHTML = e.innerHTML;
  (_a = e.parentNode) == null ? void 0 : _a.replaceChild(newTagElement, e);
  return newTagElement;
}
function getAllUniqueParents(elements) {
  return Array.from(elements).reduce((acc, v) => {
    if (v.parentElement && !acc.includes(v.parentElement)) {
      acc.push(v.parentElement);
    }
    return acc;
  }, []);
}
function findNextSibling(el) {
  if (el.nextElementSibling) return el.nextElementSibling;
  if (el.parentElement) return findNextSibling(el.parentElement);
  return null;
}
function waitForElementExists(parent, selector, callback) {
  const observer = new MutationObserver((_mutations) => {
    const el = parent.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
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
}
function watchDomChangesWithThrottle(element, callback, throttle = 1e3, options = { childList: true, subtree: true, attributes: true }) {
  let lastMutationTime;
  let timeout;
  const observer = new MutationObserver((_mutationList, _observer) => {
    const now = Date.now();
    if (lastMutationTime && now - lastMutationTime < throttle) {
      timeout && clearTimeout(timeout);
    }
    timeout = setTimeout(callback, throttle);
    lastMutationTime = now;
  });
  observer.observe(element, options);
}
function downloader(options = { append: "", after: "", button: "", cbBefore: () => {
} }) {
  var _a, _b;
  const btn = parseDom(options.button);
  if (options.append) (_a = document.querySelector(options.append)) == null ? void 0 : _a.append(btn);
  if (options.after) (_b = document.querySelector(options.after)) == null ? void 0 : _b.after(btn);
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (options.cbBefore) options.cbBefore();
    waitForElementExists(document.body, "video", (video) => {
      window.location.href = video.getAttribute("src");
    });
  });
}
const MOBILE_UA = [
  "Mozilla/5.0 (Linux; Android 10; K)",
  "AppleWebKit/537.36 (KHTML, like Gecko)",
  "Chrome/114.0.0.0 Mobile Safari/537.36"
].join(" ");
function fetchWith(url, options = { html: false, mobile: false }) {
  const reqOpts = {};
  if (options.mobile) Object.assign(reqOpts, { headers: new Headers({ "User-Agent": MOBILE_UA }) });
  return fetch(url, reqOpts).then((r) => r.text()).then((r) => options.html ? parseDom(r) : r);
}
const fetchHtml = (url) => fetchWith(url, { html: true });
const fetchText = (url) => fetchWith(url);
function objectToFormData(object) {
  const formData = new FormData();
  Object.entries(object).forEach(([k, v]) => formData.append(k, v));
  return formData;
}
function listenEvents(dom, events, callback) {
  for (const e of events) {
    dom.addEventListener(e, callback, true);
  }
}
class Tick {
  constructor(delay, startImmediate = true) {
    __publicField(this, "tick");
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    __publicField(this, "callbackFinal");
    this.delay = delay;
    this.startImmediate = startImmediate;
    this.tick = null;
    this.delay = delay;
    this.startImmediate = startImmediate;
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  start(callback, callbackFinal = null) {
    this.stop();
    this.callbackFinal = callbackFinal;
    if (this.startImmediate) callback();
    this.tick = setInterval(callback, this.delay);
  }
  stop() {
    if (this.tick !== null) {
      clearInterval(this.tick);
      this.tick = null;
    }
    if (this.callbackFinal) {
      this.callbackFinal();
      this.callbackFinal = null;
    }
  }
}
function isMob() {
  return /iPhone|Android/i.test(navigator.userAgent);
}
async function computeAsyncOneAtTime(iterable) {
  const res = [];
  for await (const f of iterable) {
    res.push(await f());
  }
  return res;
}
function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
class SyncPull {
  constructor() {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    __publicField(this, "pull", []);
    __publicField(this, "lock", false);
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getHighPriorityFirst(p = 0) {
    if (p > 3 || this.pull.length === 0) return void 0;
    const i = this.pull.findIndex((e) => e.p === p);
    if (i >= 0) {
      const res = this.pull[i].v;
      this.pull = this.pull.slice(0, i).concat(this.pull.slice(i + 1));
      return res;
    }
    return this.getHighPriorityFirst(p + 1);
  }
  *pullGenerator() {
    while (this.pull.length > 0) {
      yield this.getHighPriorityFirst();
    }
  }
  async processPull() {
    if (!this.lock) {
      this.lock = true;
      for await (const f of this.pullGenerator()) {
        await f();
      }
      this.lock = false;
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  push(x) {
    this.pull.push(x);
    this.processPull();
  }
}
function chunks(arr, n) {
  const res = [];
  for (let i = 0; i < arr.length; i += n) {
    res.push(arr.slice(i, i + n));
  }
  return res;
}
function range(size, startAt = 1) {
  return [...Array(size).keys()].map((i) => i + startAt);
}
export {
  LazyImgLoader,
  MOBILE_UA,
  Observer,
  SyncPull,
  Tick,
  chunks,
  circularShift,
  computeAsyncOneAtTime,
  copyAttributes,
  downloader,
  fetchHtml,
  fetchText,
  fetchWith,
  findNextSibling,
  getAllUniqueParents,
  isMob,
  listenEvents,
  objectToFormData,
  parseCSSUrl,
  parseDataParams,
  parseDom,
  parseIntegerOr,
  range,
  replaceElementTag,
  sanitizeStr,
  stringToWords,
  timeToSeconds,
  wait,
  waitForElementExists,
  watchDomChangesWithThrottle,
  watchElementChildrenCount
};
//# sourceMappingURL=billy-herrington-utils.es.js.map
