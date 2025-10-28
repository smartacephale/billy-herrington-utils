var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
function stringToWords(s) {
  return s.split(",").map((s2) => s2.trim().toLowerCase()).filter((_) => _);
}
function sanitizeStr(s) {
  return s?.replace(/\n|\t/g, " ").replace(/ {2,}/g, " ").trim().toLowerCase() || "";
}
class DataFilter {
  constructor(rules, state) {
    __publicField(this, "filters");
    __publicField(this, "filterPublic", () => {
      return (v) => {
        const isPublic = !this.rules.isPrivate(v.element);
        return {
          condition: this.state.filterPublic && isPublic,
          tag: "filter-public"
        };
      };
    });
    __publicField(this, "filterPrivate", () => {
      return (v) => {
        const isPrivate = this.rules.isPrivate(v.element);
        return {
          condition: this.state.filterPrivate && isPrivate,
          tag: "filter-private"
        };
      };
    });
    __publicField(this, "filterHD", () => {
      return (v) => {
        const isHD = this.rules.isHD(v.element);
        return {
          condition: this.state.filterHD && isHD,
          tag: "filter-hd"
        };
      };
    });
    __publicField(this, "filterDuration", () => {
      return (v) => {
        const notInRange = v.duration < this.state.filterDurationFrom || v.duration > this.state.filterDurationTo;
        return {
          condition: this.state.filterDuration && notInRange,
          tag: "filter-duration"
        };
      };
    });
    __publicField(this, "filterExclude", () => {
      const tags = DataManager.filterDSLToRegex(this.state.filterExcludeWords);
      return (v) => {
        const containTags = tags.some((tag) => tag.test(v.title));
        return {
          condition: this.state.filterExclude && containTags,
          tag: "filter-exclude"
        };
      };
    });
    __publicField(this, "filterInclude", () => {
      const tags = DataManager.filterDSLToRegex(this.state.filterIncludeWords);
      return (v) => {
        const containTagsNot = tags.some((tag) => !tag.test(v.title));
        return {
          condition: this.state.filterInclude && containTagsNot,
          tag: "filter-include"
        };
      };
    });
    this.rules = rules;
    this.state = state;
    this.state = state;
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
        updates.forEach((update) => {
          update();
        });
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
      const thumbs = this.rules.getThumbs(html);
      const data_offset = this.data.size;
      for (const thumbElement of thumbs) {
        const url = this.rules.getThumbUrl(thumbElement);
        if (!url || this.data.has(url)) {
          if (removeDuplicates) thumbElement.remove();
          continue;
        }
        const data = this.rules.getThumbData(thumbElement);
        this.data.set(url, { element: thumbElement, ...data });
        if (shouldLazify) {
          const { img, imgSrc } = this.rules.getThumbImgData(thumbElement);
          this.lazyImgLoader.lazify(thumbElement, img, imgSrc);
        }
        const parent = container || this.rules.container;
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
    const targets = [window, globalThis.unsafeWindow].filter(Boolean);
    targets.forEach((w) => {
      Object.assign(w, {
        sortByDuration: () => this.sort("duration"),
        sortByViews: () => this.sort("view")
      });
    });
  }
  static filterDSLToRegex(str) {
    const toFullWord = (w) => `(^|\\ )${w}($|\\ )`;
    const str_ = str.replace(/f:(\w+)/g, (_, w) => toFullWord(w));
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
class InfiniteScroller {
  constructor({
    enabled = true,
    delay = 300,
    writeHistory = false,
    paginationOffset,
    paginationLast,
    paginationElement,
    paginationUrlGenerator,
    parseData,
    alternativeGenerator,
    intersectionObservable
  }) {
    __publicField(this, "paginationGenerator");
    __publicField(this, "enabled");
    __publicField(this, "delay");
    __publicField(this, "paginationOffset");
    __publicField(this, "paginationLast");
    __publicField(this, "writeHistory");
    __publicField(this, "parseData");
    __publicField(this, "onScrollCBs", []);
    __publicField(this, "generatorConsumer", async () => {
      if (!this.enabled) return false;
      const { value: { url, offset } = {}, done } = await this.paginationGenerator.next();
      if (!done) {
        const nextPageHTML = await fetchHtml(url);
        const prevScrollPos = document.documentElement.scrollTop;
        this.paginationOffset = offset;
        this.parseData(nextPageHTML);
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
    this.parseData = parseData;
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
    this.onScrollCBs.forEach((cb) => {
      cb(this);
    });
  }
  static *createPaginationGenerator(currentPage, totalPages, generateURL) {
    for (let offset = currentPage + 1; offset <= totalPages; offset++) {
      const url = generateURL(offset);
      yield { url, offset };
    }
  }
}
function createInfiniteScroller(store, parseData, rules) {
  const enabled = store.state.infiniteScrollEnabled;
  const paginationOffset = rules.paginationStrategy.getPaginationOffset();
  const paginationElement = rules.paginationStrategy.getPaginationElement();
  const paginationLast = rules.paginationStrategy.getPaginationLast();
  const paginationUrlGenerator = rules.paginationStrategy.getPaginationUrlGenerator();
  const iscroller = new InfiniteScroller({
    enabled,
    parseData,
    paginationLast,
    paginationOffset,
    paginationElement,
    paginationUrlGenerator,
    ...rules
  }).onScroll(({ paginationLast: paginationLast2, paginationOffset: paginationOffset2 }) => {
    store.localState.pagIndexLast = paginationLast2;
    store.localState.pagIndexCur = paginationOffset2;
  }, true);
  store.subscribe(() => {
    iscroller.enabled = store.state.infiniteScrollEnabled;
  });
  return iscroller;
}
function getPaginationLinks(doc = document, url = location.href, pathnameSelector = /\/(page\/)?\d+\/?$/) {
  const currentUrl = parseURL(url);
  currentUrl.pathname = currentUrl.pathname.replace(pathnameSelector, "/");
  const pageLinks = Array.from(
    doc.querySelectorAll("a[href]") || [],
    (a) => a.href
  ).filter((h) => {
    try {
      const linkUrl = new URL(h.replace(/#\w*$/, ""), doc.baseURI || currentUrl.origin);
      return linkUrl.origin === currentUrl.origin && linkUrl.pathname.startsWith(currentUrl.pathname);
    } catch {
      return false;
    }
  });
  return pageLinks;
}
function parseURL(s) {
  if (typeof s === "string") return new URL(s);
  return new URL(s.href);
}
function upgradePathname(curr, links) {
  if (/\/(page\/)?\d+\/?$/.test(curr.pathname) || links.length < 1) return curr;
  const linksDepaginated = links.map((l) => {
    l.pathname = l.pathname.replace(/\/(page\/)?\d+\/?$/, "/");
    return l;
  });
  if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;
  const last = linksDepaginated.at(-1);
  if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
  return curr;
}
class PaginationStrategy {
  constructor(options) {
    __publicField(this, "doc", document);
    __publicField(this, "url");
    __publicField(this, "paginationSelector", ".pagination");
    __publicField(this, "searchParamSelector", "page");
    __publicField(this, "pathnameSelector", /\/(\d+)\/?$/);
    __publicField(this, "fixPaginationLast");
    __publicField(this, "offsetMin", 1);
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        Object.assign(this, { [k]: v });
      });
    }
    this.url = parseURL(options?.url || this.doc.URL);
  }
  getPaginationElement() {
    return this.doc.querySelector(this.paginationSelector);
  }
  get hasPagination() {
    return !!this.getPaginationElement();
  }
  getPaginationOffset() {
    return this.offsetMin;
  }
  getPaginationLast() {
    return this.offsetMin;
  }
  getPaginationUrlGenerator() {
    return (_) => this.url.href;
  }
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
  const paramsStr = decodeURI(str.trim()).split(";");
  return paramsStr.reduce((acc, s) => {
    const parsed = s.match(/([\+\w]+):([\w\-\ ]+)?/);
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
class PaginationStrategyDataParams extends PaginationStrategy {
  getPaginationLast() {
    const links = this.getPaginationElement()?.querySelectorAll("[data-parameters *= from]");
    const pages = Array.from(links || [], (l) => {
      const p = l.getAttribute("data-parameters");
      const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
      return parseInt(v);
    });
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.fixPaginationLast) return this.fixPaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    const link = this.getPaginationElement()?.querySelector(
      ".prev[data-parameters *= from], .prev [data-parameters *= from]"
    );
    if (!link) return this.offsetMin;
    const p = link.getAttribute("data-parameters");
    const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
    return parseInt(v);
  }
  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);
    const parametersElement = this.getPaginationElement()?.querySelector(
      "a[data-block-id][data-parameters]"
    );
    const block_id = parametersElement?.getAttribute("data-block-id") || "";
    const parameters = parseDataParams(parametersElement?.getAttribute("data-parameters") || "");
    const attrs = {
      block_id,
      function: "get_block",
      mode: "async",
      ...parameters
    };
    Object.keys(attrs).forEach((k) => {
      url.searchParams.set(k, attrs[k]);
    });
    const paginationUrlGenerator = (n) => {
      Object.keys(attrs).forEach((k) => {
        k.includes("from") && url.searchParams.set(k, n.toString());
      });
      url.searchParams.set("_", Date.now().toString());
      return url.href;
    };
    return paginationUrlGenerator;
  }
}
class PaginationStrategyPathnameParams extends PaginationStrategy {
  constructor() {
    super(...arguments);
    __publicField(this, "extractPage", (a) => {
      const href = typeof a === "string" ? a : a.href;
      const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
      return parseInt(pathname.match(this.pathnameSelector)?.pop() || this.offsetMin.toString());
    });
  }
  getPaginationLast() {
    const links = getPaginationLinks(
      this.getPaginationElement() || document,
      this.url.href,
      this.pathnameSelector
    );
    const pages = Array.from(links, this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.fixPaginationLast) return this.fixPaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    return this.extractPage(this.url.href);
  }
  getPaginationUrlGenerator(url_ = this.url) {
    const url = new URL(url_.href);
    const pathnameSelectorPlaceholder = this.pathnameSelector.toString().replace(/[/|\\|$|?|(|)]+/g, "/");
    if (!this.pathnameSelector.test(url.pathname)) {
      url.pathname = url.pathname.concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString())).replace(/\/{2,}/g, "/");
    }
    const paginationUrlGenerator = (offset) => {
      url.pathname = url.pathname.replace(
        this.pathnameSelector,
        pathnameSelectorPlaceholder.replace(/d\+/, offset.toString())
      );
      return url.href;
    };
    return paginationUrlGenerator;
  }
}
class PaginationStrategySearchParams extends PaginationStrategy {
  constructor() {
    super(...arguments);
    __publicField(this, "extractPage", (a) => {
      const href = typeof a === "string" ? a : a.href;
      const p = new URL(href).searchParams.get(this.searchParamSelector);
      return parseInt(p) || this.offsetMin;
    });
  }
  static checkLink(link, searchParamSelector) {
    const searchParamSelectors = ["page", "p"];
    if (searchParamSelector) searchParamSelectors.push(searchParamSelector);
    return searchParamSelectors.some((p) => link.searchParams.get(p) !== null);
  }
  getPaginationLast() {
    const links = getPaginationLinks(
      this.getPaginationElement() || document,
      this.url.href
    ).filter((h) => PaginationStrategySearchParams.checkLink(new URL(h), this.searchParamSelector));
    const pages = links.map(this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.fixPaginationLast) return this.fixPaginationLast(lastPage);
    return lastPage;
  }
  getPaginationOffset() {
    if (this.doc === document) {
      return this.extractPage(this.url);
    }
    const link = this.getPaginationElement()?.querySelector(
      `a.active[href *= "${this.searchParamSelector}="]`
    );
    return this.extractPage(link);
  }
  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);
    const paginationUrlGenerator = (offset) => {
      url.searchParams.set(this.searchParamSelector, offset.toString());
      return url.href;
    };
    return paginationUrlGenerator;
  }
}
function getPaginationStrategy(options) {
  const {
    doc = document,
    url = location.href,
    paginationSelector = ".pagination",
    searchParamSelector
  } = options;
  const pagination = doc.querySelector(paginationSelector);
  if (!pagination) {
    console.error("Found No Pagination");
    return new PaginationStrategy(options);
  }
  const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));
  console.log({ pageLinks: pageLinks.map((l) => l.href) });
  const getStrategy = () => {
    const dataParamLinks = Array.from(pagination.querySelectorAll("[data-parameters *= from]"));
    if (dataParamLinks.length > 0) {
      console.log("PaginationStrategyDataParams", dataParamLinks);
      return PaginationStrategyDataParams;
    }
    if (pageLinks.some((h) => PaginationStrategySearchParams.checkLink(h, searchParamSelector))) {
      const l = pageLinks.filter((h) => PaginationStrategySearchParams.checkLink(h, searchParamSelector)).map((h) => h.href);
      console.log("PaginationStrategySearchParams", l);
      return PaginationStrategySearchParams;
    }
    if (pageLinks.some((h) => /\/(page\/)?\d+\/?$/.test(h.pathname))) {
      const pathnameMatched = pageLinks.filter((h) => /\/(page\/)?\d+\/?$/.test(h.pathname));
      console.log(
        "PaginationStrategyPathnameParams",
        pathnameMatched.map((h) => h.href)
      );
      options.url = upgradePathname(parseURL(url), pathnameMatched);
      return PaginationStrategyPathnameParams;
    }
    console.error("Found No Strategy");
    return PaginationStrategy;
  };
  const paginationStrategy = new (getStrategy())(options);
  console.log("paginationStrategy", paginationStrategy);
  return paginationStrategy;
}
function chunks(arr, n) {
  return Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
}
function range(size, startAt = 1, step = 1) {
  return Array.from({ length: size }, (_, index) => startAt + index * step);
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
function isMob() {
  return /iPhone|Android/i.test(navigator.userAgent);
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
function circularShift(n, c = 6, s = 1) {
  return (n + s) % c || c;
}
export {
  AsyncPool,
  DataManager,
  InfiniteScroller,
  LazyImgLoader,
  MOBILE_UA,
  Observer,
  PaginationStrategy,
  PaginationStrategyDataParams,
  PaginationStrategyPathnameParams,
  PaginationStrategySearchParams,
  Tick,
  chunks,
  circularShift,
  computeAsyncOneAtTime,
  copyAttributes,
  createInfiniteScroller,
  downloader,
  exterminateVideo,
  fetchHtml,
  fetchText,
  fetchWith,
  findNextSibling,
  getAllUniqueParents,
  getPaginationStrategy,
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
