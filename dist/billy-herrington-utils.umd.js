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
    return s?.replace(/\n|\t/, " ").replace(/ {2,}/, " ").trim().toLowerCase() || "";
  }
  function formatTimeToHHMMSS(timeString) {
    const regex = /(?:(\d+)\s*h\s*)?(?:(\d+)\s*mi?n?\s*)?(?:(\d+)\s*sec)?/;
    const match = timeString.match(regex);
    const h = parseInt(match?.[1] || "0");
    const m = parseInt(match?.[2] || "0");
    const s = parseInt(match?.[3] || "0");
    const pad = (num) => String(num).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  function timeToSeconds(t) {
    const r = /sec|min|h|m/.test(t) ? formatTimeToHHMMSS(t) : t;
    return (r?.match(/\d+/gm) || [0]).reverse().map((s, i) => parseInt(s) * 60 ** i).reduce((a, b) => a + b);
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
      timeout = setTimeout(callback, throttle);
      lastMutationTime = now;
    });
    observer.observe(element, options);
    return observer;
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
  function exterminateVideo(video) {
    video.removeAttribute("src");
    video.load();
    video.remove();
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
      this.cur++;
      const f = this.getHighPriorityFirst();
      await f?.();
      this.cur--;
      this.runTasks();
    }
    runTasks() {
      if (!this.pool.length) {
        this._resolve?.(true);
        return;
      }
      if (this.cur < this.max) {
        this.runTask();
        this.runTasks();
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
  class DataFilter {
    constructor(rules, state) {
      __publicField(this, "state");
      __publicField(this, "rules");
      __publicField(this, "filters");
      __publicField(this, "filterPublic", () => {
        return (v) => {
          const isPublic = !this.rules.IS_PRIVATE(v.element);
          return {
            tag: "filter-public",
            condition: this.state.filterPublic && isPublic
          };
        };
      });
      __publicField(this, "filterPrivate", () => {
        return (v) => {
          const isPrivate = this.rules.IS_PRIVATE(v.element);
          return {
            tag: "filter-private",
            condition: this.state.filterPrivate && isPrivate
          };
        };
      });
      __publicField(this, "filterHD", () => {
        return (v) => {
          const isHD = this.rules.IS_HD(v.element);
          return {
            tag: "filter-hd",
            condition: this.state.filterHD && isHD
          };
        };
      });
      __publicField(this, "filterDuration", () => {
        return (v) => {
          const notInRange = v.duration < this.state.filterDurationFrom || v.duration > this.state.filterDurationTo;
          return {
            tag: "filter-duration",
            condition: this.state.filterDuration && notInRange
          };
        };
      });
      __publicField(this, "filterExclude", () => {
        const tags = DataManager.filterDSLToRegex(this.state.filterExcludeWords);
        return (v) => {
          const containTags = tags.some((tag) => tag.test(v.title));
          return {
            tag: "filter-exclude",
            condition: this.state.filterExclude && containTags
          };
        };
      });
      __publicField(this, "filterInclude", () => {
        const tags = DataManager.filterDSLToRegex(this.state.filterIncludeWords);
        return (v) => {
          const containTagsNot = tags.some((tag) => !tag.test(v.title));
          return {
            tag: "filter-include",
            condition: this.state.filterInclude && containTagsNot
          };
        };
      });
      this.state = state;
      this.rules = rules;
      const methods = Object.getOwnPropertyNames(this);
      this.filters = methods.reduce((acc, k) => {
        if (k in this.state) {
          acc[k] = this[k];
          GM_addStyle(`.filter-${k.toLowerCase().slice(6)} { display: none !important; }`);
        }
        return acc;
      }, {});
    }
  }
  class DataManager {
    constructor(rules, state) {
      __publicField(this, "rules");
      __publicField(this, "state");
      __publicField(this, "data");
      __publicField(this, "lazyImgLoader");
      __publicField(this, "dataFilters");
      __publicField(this, "applyFilters", (filters, offset = 0) => {
        const filtersToApply = Object.keys(filters).filter((k) => Object.hasOwn(this.dataFilters, k)).map((k) => this.dataFilters[k]());
        if (filtersToApply.length === 0) return;
        const updates = [];
        let offset_counter = 1;
        for (const v of this.data.values()) {
          if (++offset_counter > offset) {
            for (const f of filtersToApply) {
              const { tag, condition } = f(v);
              updates.push(() => v.element.classList.toggle(tag, condition));
            }
          }
        }
        requestAnimationFrame(() => {
          updates.forEach((update) => update());
        });
      });
      __publicField(this, "filterAll", (offset) => {
        const filters = Object.assign(
          {},
          ...Object.keys(this.dataFilters).map((f) => ({
            [f]: this.state[f]
          }))
        );
        this.applyFilters(filters, offset);
      });
      __publicField(this, "parseData", (html, container, removeDuplicates = false, shouldLazify = true) => {
        const thumbs = this.rules.GET_THUMBS(html);
        const data_offset = this.data.size;
        for (const thumbElement of thumbs) {
          const url = this.rules.THUMB_URL(thumbElement);
          if (!url || this.data.has(url)) {
            if (removeDuplicates) thumbElement.remove();
            continue;
          }
          const data = this.rules.THUMB_DATA(thumbElement);
          this.data.set(url, { element: thumbElement, ...data });
          if (shouldLazify) {
            const { img, imgSrc } = this.rules.THUMB_IMG_DATA(thumbElement);
            this.lazyImgLoader.lazify(thumbElement, img, imgSrc);
          }
          const parent = container || this.rules.CONTAINER;
          if (!parent.contains(thumbElement)) parent.appendChild(thumbElement);
        }
        this.filterAll(data_offset);
      });
      this.rules = rules;
      this.state = state;
      this.data = /* @__PURE__ */ new Map();
      this.lazyImgLoader = new LazyImgLoader(
        (target) => !this.isFiltered(target)
      );
      this.dataFilters = new DataFilter(rules, state).filters;
      [window, unsafeWindow || {}].forEach((w) => {
        Object.assign(w, {
          sortByViews: () => this.sort("view"),
          sortByDuration: () => this.sort("duration")
        });
      });
    }
    static filterDSLToRegex(str) {
      const toFullWord = (w) => `(^|\\ )${w}($|\\ )`;
      const str_ = str.replace(/f\:(\w+)/g, (_, w) => toFullWord(w));
      return stringToWords(str_).map((expr) => new RegExp(expr, "i"));
    }
    isFiltered(el) {
      return el.className.includes("filtered");
    }
    sort(propName) {
      if (this.data.size < 2) return;
      const sorted = Array.from(this.data.keys()).sort((b, a) => {
        return this.data.get(a)[propName] - this.data.get(b)[propName];
      });
      const container = this.data.get(sorted[0]).element.parentElement;
      sorted.forEach((s) => {
        const e = this.data.get(s).element;
        container.append(e);
      });
    }
  }
  class InfiniteScroller {
    constructor({
      enabled = true,
      delay = 350,
      writeHistory = false,
      paginationOffset,
      paginationLast,
      paginationElement,
      paginationUrlGenerator,
      handleHtmlCallback,
      alternativeGenerator,
      intersectionObservable
    }) {
      __publicField(this, "paginationGenerator");
      __publicField(this, "enabled");
      __publicField(this, "delay");
      __publicField(this, "paginationOffset");
      __publicField(this, "paginationLast");
      __publicField(this, "writeHistory");
      __publicField(this, "handleHtmlCallback");
      __publicField(this, "onScrollCBs", []);
      __publicField(this, "generatorConsumer", async () => {
        if (!this.enabled) return false;
        const {
          value: { url, offset } = {},
          done
        } = await this.paginationGenerator.next();
        if (!done) {
          const nextPageHTML = await fetchHtml(url);
          const prevScrollPos = document.documentElement.scrollTop;
          this.paginationOffset = offset;
          this.handleHtmlCallback(nextPageHTML);
          this._onScroll();
          window.scrollTo(0, prevScrollPos);
          if (this.writeHistory) {
            history.replaceState({}, "", url);
          }
        }
        return !done;
      });
      this.enabled = enabled;
      this.delay = delay;
      this.writeHistory = writeHistory;
      this.paginationOffset = paginationOffset;
      this.paginationLast = paginationLast;
      this.handleHtmlCallback = handleHtmlCallback;
      this.paginationGenerator = alternativeGenerator?.() ?? InfiniteScroller.createPaginationGenerator(
        paginationOffset,
        paginationLast,
        paginationUrlGenerator
      );
      const observable = intersectionObservable || paginationElement;
      Observer.observeWhile(observable, this.generatorConsumer, this.delay);
    }
    onScroll(callback, initCall = false) {
      if (initCall) callback(this);
      this.onScrollCBs.push(callback);
      return this;
    }
    _onScroll() {
      this.onScrollCBs.forEach((cb) => cb(this));
    }
    static *createPaginationGenerator(currentPage, totalPages, generateURL) {
      for (let offset = currentPage + 1; offset <= totalPages; offset++) {
        const url = generateURL(offset);
        yield { url, offset };
      }
    }
  }
  function createInfiniteScroller(store, handleHtmlCallback, rules) {
    const enabled = store.state.infiniteScrollEnabled;
    const iscroller = new InfiniteScroller({
      enabled,
      handleHtmlCallback,
      ...rules
    }).onScroll(({ paginationLast, paginationOffset }) => {
      store.localState.pagIndexLast = paginationLast;
      store.localState.pagIndexCur = paginationOffset;
    }, true);
    store.subscribe(() => {
      iscroller.enabled = store.state.infiniteScrollEnabled;
    });
    return iscroller;
  }
  class RulesHelper {
    constructor(options) {
      __publicField(this, "delay", 250);
      __publicField(this, "IS_VIDEO_PAGE");
      __publicField(this, "IS_SEARCH_PAGE");
      __publicField(this, "paginationElement");
      __publicField(this, "paginationOffset");
      __publicField(this, "paginationLast");
      __publicField(this, "URL_DATA");
      __publicField(this, "paginationUrlGenerator", (offset) => {
        const opt = this.options.paginationUrlGenerator;
        if (typeof opt === "function") return opt(offset);
        const url = new URL(location.href);
        if (opt.searchPage) {
          url.searchParams.set(opt.searchPage, offset.toString());
          return url.href;
        }
        if (opt.pathnameLast) {
          if (url.pathname === "/") url.pathname = "/1";
          if (/\d+$/.test(url.pathname)) {
            url.pathname = url.pathname.replace(/\d+$/, offset.toString());
          } else {
            url.pathname = `${url.pathname}/${offset}`;
          }
          return url.href;
        }
        return url.href;
      });
      __publicField(this, "_IS_VIDEO_PAGE", () => {
        if (typeof this.options.IS_VIDEO_PAGE === "boolean") {
          return this.options.IS_VIDEO_PAGE;
        }
        return this.options.IS_VIDEO_PAGE.test(location.pathname);
      });
      __publicField(this, "_IS_SEARCH_PAGE", () => {
        if (typeof this.options.IS_SEARCH_PAGE === "boolean") {
          return this.options.IS_SEARCH_PAGE;
        }
        return this.options.IS_SEARCH_PAGE.test(location.pathname);
      });
      __publicField(this, "_paginationElement", (html = document) => {
        if (typeof this.options.paginationElement === "function") {
          return this.options.paginationElement(html);
        }
        return [...html.querySelectorAll(this.options.paginationElement)].pop();
      });
      __publicField(this, "CONTAINER", (html = document) => {
        if (typeof this.options.CONTAINER === "function") {
          return this.options.CONTAINER(html);
        }
        return [...html.querySelectorAll(this.options.CONTAINER)].pop();
      });
      __publicField(this, "THUMB_URL", (thumb) => {
        if (typeof this.options.THUMB_URL === "string") {
          return thumb.querySelector(this.options.THUMB_URL).href || "";
        }
        return this.options.THUMB_URL(thumb);
      });
      __publicField(this, "GET_THUMBS", (html) => {
        if (typeof this.options.GET_THUMBS === "string") {
          return [...html.querySelectorAll(this.options.GET_THUMBS)];
        }
        return this.options.GET_THUMBS(html);
      });
      __publicField(this, "THUMB_DATA", (thumb) => {
        const opt = this.options.THUMB_DATA;
        if (typeof opt === "function") return opt(thumb);
        let title = sanitizeStr(thumb.querySelector(opt.title)?.innerText || "");
        if (opt.uploader) {
          const uploader = sanitizeStr(
            thumb.querySelector(opt.title)?.innerText || ""
          );
          title = `${title} user:${uploader}`;
        }
        const duration = !opt.duration ? 0 : timeToSeconds(
          sanitizeStr(thumb.querySelector(opt.duration)?.innerText || "")
        );
        return { title, duration };
      });
      __publicField(this, "THUMB_IMG_DATA", (thumb) => {
        const opt = this.options.THUMB_IMG_DATA;
        if (typeof opt === "function") return opt(thumb);
        const result = {};
        if (opt.img) {
          const img = thumb.querySelector(opt.img);
          const imgSrc = img.getAttribute(opt.imgSrc || "data-src") || img.getAttribute("src");
          if (opt.lazyloading) {
            img.classList.remove(opt.lazyloading);
          }
          Object.assign(result, { img, imgSrc });
          if (img.complete && img.getAttribute("src") && !img.src.includes("data:image")) {
            return {};
          }
        } else return {};
      });
      this.options = options;
      this.delay = options?.delay || this.delay;
      this.paginationOffset = this.options.paginationOffset;
      this.paginationLast = this.options.paginationLast;
      this.IS_VIDEO_PAGE = this._IS_VIDEO_PAGE();
      this.IS_SEARCH_PAGE = this._IS_SEARCH_PAGE();
      this.paginationElement = this._paginationElement();
      if (options.URL_DATA) {
        this.URL_DATA = options.URL_DATA;
        Object.assign(this, this.URL_DATA());
      }
    }
    router(store, handleHtmlCallback) {
      if (!this.options.router) return;
      const scroller = createInfiniteScroller(store, handleHtmlCallback, this);
      this.options.router(this, store, handleHtmlCallback, scroller);
    }
  }
  exports2.AsyncPool = AsyncPool;
  exports2.DataManager = DataManager;
  exports2.InfiniteScroller = InfiniteScroller;
  exports2.LazyImgLoader = LazyImgLoader;
  exports2.MOBILE_UA = MOBILE_UA;
  exports2.Observer = Observer;
  exports2.RulesHelper = RulesHelper;
  exports2.Tick = Tick;
  exports2.chunks = chunks;
  exports2.circularShift = circularShift;
  exports2.computeAsyncOneAtTime = computeAsyncOneAtTime;
  exports2.copyAttributes = copyAttributes;
  exports2.createInfiniteScroller = createInfiniteScroller;
  exports2.downloader = downloader;
  exports2.exterminateVideo = exterminateVideo;
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
