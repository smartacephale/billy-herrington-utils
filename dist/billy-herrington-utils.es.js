var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
function stringToWords(s) {
  return s.split(",").map((s2) => s2.trim().toLowerCase()).filter((_) => _);
}
function sanitizeStr(s) {
  return s?.replace(/\n|\t/, " ").replace(/ {2,}/, " ").trim().toLowerCase() || "";
}
function timeToSeconds(t) {
  return (t?.match(/\d+/gm) || [0]).reverse().map((s, i) => parseInt(s) * 60 ** i).reduce((a, b) => a + b);
}
function parseIntegerOr(n, or) {
  return ((num) => Number.isNaN(num) ? or : num)(parseInt(n));
}
function parseDataParams(str) {
  return str.split(";").reduce((acc, s) => {
    const parsed = s.match(/([\+\w]+):(\w+)?/);
    if (parsed) {
      const [, key, value] = parsed;
      if (value) {
        key.split("+").forEach((p) => {
          acc[p] = value;
        });
      }
    }
    return acc;
  }, {});
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
  constructor(shouldDelazify) {
    __publicField(this, "lazyImgObserver");
    __publicField(this, "attributeName", "data-lazy-load");
    __publicField(this, "delazify", (target) => {
      this.lazyImgObserver.observer.unobserve(target);
      target.src = target.getAttribute(this.attributeName);
      target.removeAttribute(this.attributeName);
    });
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
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);
  newTagElement.innerHTML = e.innerHTML;
  e.parentNode?.replaceChild(newTagElement, e);
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
  const btn = parseDom(options.button);
  if (options.append) document.querySelector(options.append)?.append(btn);
  if (options.after) document.querySelector(options.after)?.after(btn);
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
    __publicField(this, "callbackFinal");
    this.delay = delay;
    this.startImmediate = startImmediate;
  }
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
class AsyncPool {
  constructor(max = 1, pool = []) {
    __publicField(this, "cur", 0);
    __publicField(this, "finished");
    __publicField(this, "_resolve");
    this.max = max;
    this.pool = pool;
    this.finished = new Promise((resolve) => {
      this._resolve = resolve;
    });
  }
  static async doNAsyncAtOnce(max = 1, pool = []) {
    const spool = new AsyncPool(max);
    pool.forEach((f) => spool.push(f));
    return spool.run();
  }
  getHighPriorityFirst(p = 0) {
    if (p > 3 || this.pool.length === 0) return void 0;
    const i = this.pool.findIndex((e) => e.p === p);
    if (i >= 0) {
      const res = this.pool[i].v;
      this.pool.splice(i, 1);
      return res;
    }
    return this.getHighPriorityFirst(p + 1);
  }
  async runTask() {
    const taskFunc = this.getHighPriorityFirst();
    if (!taskFunc) {
      this.checkCompletion();
      return;
    }
    this.cur++;
    try {
      await taskFunc();
    } catch (error) {
      console.error("Task execution failed:", error);
    } finally {
      this.cur--;
      this.runTasks();
    }
  }
  checkCompletion() {
    if (this.pool.length === 0 && this.cur === 0) {
      this._resolve?.(true);
    }
  }
  runTasks() {
    while (this.cur < this.max) {
      this.runTask();
    }
  }
  async run() {
    this.runTasks();
    return this.finished;
  }
  push(x) {
    this.pool.push("p" in x ? x : { v: x, p: 0 });
  }
}
function chunks(arr, n) {
  return Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
}
function range(size, startAt = 1, step = 1) {
  return Array.from({ length: size }, (_, index) => startAt + index * step);
}
export {
  AsyncPool,
  LazyImgLoader,
  MOBILE_UA,
  Observer,
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
