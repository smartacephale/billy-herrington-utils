var b = Object.defineProperty;
var d = (e, t, r) => t in e ? b(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var o = (e, t, r) => d(e, typeof t != "symbol" ? t + "" : t, r);
function I(e) {
  return e.split(",").map((t) => t.trim().toLowerCase()).filter((t) => t);
}
function A(e) {
  return (e == null ? void 0 : e.replace(/\n|\t/, " ").replace(/ {2,}/, " ").trim().toLowerCase()) || "";
}
function E(e) {
  return ((e == null ? void 0 : e.match(/\d+/gm)) || [0]).reverse().map((t, r) => parseInt(t) * 60 ** r).reduce((t, r) => t + r);
}
function T(e, t) {
  return Number.isInteger(parseInt(e)) ? parseInt(e) : t;
}
function L(e) {
  const t = e.split(";").flatMap((r) => {
    const n = r.match(/([\+\w+]+):(\w+)?/), i = n == null ? void 0 : n[2];
    if (i) return n[1].split("+").map((s) => ({ [s]: i }));
  }).filter((r) => r);
  return Object.assign({}, ...t);
}
function O(e) {
  return e.replace(/url\("|\"\).*/g, "");
}
class l {
  constructor(t) {
    o(this, "observer");
    this.callback = t, this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }
  observe(t) {
    this.observer.observe(t);
  }
  throttle(t, r) {
    this.observer.unobserve(t), setTimeout(() => this.observer.observe(t), r);
  }
  handleIntersection(t) {
    for (const r of t)
      r.isIntersecting && this.callback(r.target);
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static observeWhile(t, r, n) {
    const i = new l(async (s) => {
      await r() && i.throttle(s, n);
    });
    return i.observe(t), i;
  }
}
class u {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  constructor(t, r = "data-lazy-load", n = !0) {
    o(this, "lazyImgObserver");
    o(this, "delazify", (t) => {
      this.lazyImgObserver.observer.unobserve(t), t.src = t.getAttribute(this.attributeName), this.removeTagAfter && t.removeAttribute(this.attributeName);
    });
    this.attributeName = r, this.removeTagAfter = n, this.lazyImgObserver = new l((i) => {
      t(i, this.delazify);
    });
  }
  lazify(t, r, n) {
    !r || !n || (r.setAttribute(this.attributeName, n), r.src = "", this.lazyImgObserver.observe(r));
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  static create(t) {
    return new u((n, i) => {
      t(n) && i(n);
    });
  }
}
function M(e, t = 6, r = 1) {
  return (e + r) % t || t;
}
function h(e) {
  const t = new DOMParser().parseFromString(e, "text/html").body;
  return t.children.length > 1 ? t : t.firstElementChild;
}
function m(e, t) {
  for (const r of t.attributes)
    r.nodeValue && e.setAttribute(r.nodeName, r.nodeValue);
}
function S(e, t) {
  var n;
  const r = document.createElement(t);
  return m(r, e), r.innerHTML = e.innerHTML, (n = e.parentNode) == null || n.replaceChild(r, e), r;
}
function z(e) {
  return Array.from(e).reduce((t, r) => (r.parentElement && !t.includes(r.parentElement) && t.push(r.parentElement), t), []);
}
function p(e) {
  return e.nextElementSibling ? e.nextElementSibling : e.parentElement ? p(e.parentElement) : null;
}
function v(e, t, r) {
  const n = new MutationObserver((i) => {
    const s = e.querySelector(t);
    s && (n.disconnect(), r(s));
  });
  n.observe(document.body, { childList: !0, subtree: !0 });
}
function F(e, t) {
  let r = e.children.length;
  new MutationObserver((i, s) => {
    for (const a of i)
      a.type === "childList" && r !== e.children.length && (r = e.children.length, t(s, r));
  }).observe(e, { childList: !0 });
}
function P(e, t, r = 1e3, n = { childList: !0, subtree: !0, attributes: !0 }) {
  let i, s;
  new MutationObserver((y, w) => {
    const c = Date.now();
    i && c - i < r && s && clearTimeout(s), s = setTimeout(t, r), i = c;
  }).observe(e, n);
}
function x(e = { append: "", after: "", button: "", cbBefore: () => {
} }) {
  var r, n;
  const t = h(e.button);
  e.append && ((r = document.querySelector(e.append)) == null || r.append(t)), e.after && ((n = document.querySelector(e.after)) == null || n.after(t)), t.addEventListener("click", (i) => {
    i.preventDefault(), e.cbBefore && e.cbBefore(), v(document.body, "video", (s) => {
      window.location.href = s.getAttribute("src");
    });
  });
}
const g = [
  "Mozilla/5.0 (Linux; Android 10; K)",
  "AppleWebKit/537.36 (KHTML, like Gecko)",
  "Chrome/114.0.0.0 Mobile Safari/537.36"
].join(" ");
function f(e, t = { html: !1, mobile: !1 }) {
  const r = {};
  return t.mobile && Object.assign(r, { headers: new Headers({ "User-Agent": g }) }), fetch(e, r).then((n) => n.text()).then((n) => t.html ? h(n) : n);
}
const C = (e) => f(e, { html: !0 }), D = (e) => f(e);
function H(e) {
  const t = new FormData();
  return Object.entries(e).forEach(([r, n]) => t.append(r, n)), t;
}
function N(e, t, r) {
  for (const n of t)
    e.addEventListener(n, r, !0);
}
class j {
  constructor(t, r = !0) {
    o(this, "tick");
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    o(this, "callbackFinal");
    this.delay = t, this.startImmediate = r, this.tick = null, this.delay = t, this.startImmediate = r;
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  start(t, r = null) {
    this.stop(), this.callbackFinal = r, this.startImmediate && t(), this.tick = setInterval(t, this.delay);
  }
  stop() {
    this.tick !== null && (clearInterval(this.tick), this.tick = null), this.callbackFinal && (this.callbackFinal(), this.callbackFinal = null);
  }
}
function q() {
  return /iPhone|Android/i.test(navigator.userAgent);
}
async function W(e) {
  const t = [];
  for await (const r of e)
    t.push(await r());
  return t;
}
function B(e) {
  return new Promise((t) => setTimeout(t, e));
}
class U {
  constructor() {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    o(this, "pull", []);
    o(this, "lock", !1);
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  getHighPriorityFirst(t = 0) {
    if (t > 3 || this.pull.length === 0) return;
    const r = this.pull.findIndex((n) => n.p === t);
    if (r >= 0) {
      const n = this.pull[r].v;
      return this.pull = this.pull.slice(0, r).concat(this.pull.slice(r + 1)), n;
    }
    return this.getHighPriorityFirst(t + 1);
  }
  *pullGenerator() {
    for (; this.pull.length > 0; )
      yield this.getHighPriorityFirst();
  }
  async processPull() {
    if (!this.lock) {
      this.lock = !0;
      for await (const t of this.pullGenerator())
        await t();
      this.lock = !1;
    }
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  push(t) {
    this.pull.push(t), this.processPull();
  }
}
function _(e, t) {
  const r = [];
  for (let n = 0; n < e.length; n += t)
    r.push(e.slice(n, n + t));
  return r;
}
function G(e, t = 1) {
  return [...Array(e).keys()].map((r) => r + t);
}
export {
  u as LazyImgLoader,
  g as MOBILE_UA,
  l as Observer,
  U as SyncPull,
  j as Tick,
  _ as chunks,
  M as circularShift,
  W as computeAsyncOneAtTime,
  m as copyAttributes,
  x as downloader,
  C as fetchHtml,
  D as fetchText,
  f as fetchWith,
  p as findNextSibling,
  z as getAllUniqueParents,
  q as isMob,
  N as listenEvents,
  H as objectToFormData,
  O as parseCSSUrl,
  L as parseDataParams,
  h as parseDom,
  T as parseIntegerOr,
  G as range,
  S as replaceElementTag,
  A as sanitizeStr,
  I as stringToWords,
  E as timeToSeconds,
  B as wait,
  v as waitForElementExists,
  P as watchDomChangesWithThrottle,
  F as watchElementChildrenCount
};
