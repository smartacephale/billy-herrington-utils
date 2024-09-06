(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.bhutils = {}));
})(this, function(exports2) {
  "use strict";var __defProp = Object.defineProperty;
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
      __publicField(this, "callbackFinal");
      this.delay = delay;
      this.startImmediate = startImmediate;
      this.tick = null;
      this.delay = delay;
      this.startImmediate = startImmediate;
    }
    start(callback, callbackFinal = void 0) {
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
  class SyncPull {
    constructor() {
      __publicField(this, "pull", []);
      __publicField(this, "lock", false);
    }
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
          await (f == null ? void 0 : f());
        }
        this.lock = false;
      }
    }
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
  exports2.LazyImgLoader = LazyImgLoader;
  exports2.MOBILE_UA = MOBILE_UA;
  exports2.Observer = Observer;
  exports2.SyncPull = SyncPull;
  exports2.Tick = Tick;
  exports2.chunks = chunks;
  exports2.circularShift = circularShift;
  exports2.computeAsyncOneAtTime = computeAsyncOneAtTime;
  exports2.copyAttributes = copyAttributes;
  exports2.downloader = downloader;
  exports2.fetchHtml = fetchHtml;
  exports2.fetchText = fetchText;
  exports2.fetchWith = fetchWith;
  exports2.findNextSibling = findNextSibling;
  exports2.getAllUniqueParents = getAllUniqueParents;
  exports2.isMob = isMob;
  exports2.listenEvents = listenEvents;
  exports2.objectToFormData = objectToFormData;
  exports2.parseCSSUrl = parseCSSUrl;
  exports2.parseDataParams = parseDataParams;
  exports2.parseDom = parseDom;
  exports2.parseIntegerOr = parseIntegerOr;
  exports2.range = range;
  exports2.replaceElementTag = replaceElementTag;
  exports2.sanitizeStr = sanitizeStr;
  exports2.stringToWords = stringToWords;
  exports2.timeToSeconds = timeToSeconds;
  exports2.wait = wait;
  exports2.waitForElementExists = waitForElementExists;
  exports2.watchDomChangesWithThrottle = watchDomChangesWithThrottle;
  exports2.watchElementChildrenCount = watchElementChildrenCount;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=billy-herrington-utils.umd.js.map
