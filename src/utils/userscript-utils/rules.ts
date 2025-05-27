import type { InfiniteScroller } from '../infinite-scroll';
import type { JabroniStore } from '../jabroni-outfit-wrap';
import { createInfiniteScroller } from '../jabroni-outfit-wrap';
import { timeToSeconds } from '../parsers';
import { sanitizeStr } from '../strings';

export interface IRulesHelper {
  delay?: number;
  IS_VIDEO_PAGE: boolean | RegExp;
  IS_SEARCH_PAGE: boolean | RegExp;
  THUMB_URL: string | ((thumb: HTMLElement) => string);
  GET_THUMBS: string | ((html: HTMLElement) => Array<HTMLElement>);
  THUMB_DATA:
    | { title: string; uploader?: string; duration?: string }
    | ((thumb: HTMLElement) => { title: string; duration: number });
  THUMB_IMG_DATA:
    | { img?: string; imgSrc?: string; lazyloading?: string }
    | ((thumb: HTMLElement) => { img?: HTMLElement; imgSrc?: string });
  paginationUrlGenerator:
    | ((offset: number) => string)
    | { searchPage?: string; pathnameLast?: boolean };
  paginationElement: string | ((html?: HTMLElement) => HTMLElement);
  paginationOffset: number;
  paginationLast: number;
  CONTAINER: string | ((html?: HTMLElement) => HTMLElement);
  router?: (
    rules: RulesHelper,
    store: JabroniStore,
    handleHtmlCallback: (document: HTMLElement) => void,
    scroller: InfiniteScroller,
  ) => void;
  URL_DATA?: () => {
    paginationOffset: number;
    paginationUrlGenerator: (offset: number) => string;
  };
}

export class RulesHelper {
  public delay = 250;
  public IS_VIDEO_PAGE: boolean;
  public IS_SEARCH_PAGE: boolean;
  public paginationElement: HTMLElement;
  public paginationOffset: number;
  public paginationLast: number;
  public URL_DATA:
    | undefined
    | (() => {
        paginationOffset: number;
        paginationUrlGenerator: (offset: number) => string;
      });

  constructor(private options: IRulesHelper) {
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

  public router(store: JabroniStore, handleHtmlCallback: (document: HTMLElement) => void): void {
    if (!this.options.router) return;
    const scroller = createInfiniteScroller(store, handleHtmlCallback, this);
    this.options.router(this, store, handleHtmlCallback, scroller);
  }

  public paginationUrlGenerator = (offset: number): string => {
    const opt = this.options.paginationUrlGenerator;
    if (typeof opt === 'function') return opt(offset);

    const url = new URL(location.href);

    if (opt.searchPage) {
      url.searchParams.set(opt.searchPage, offset.toString());
      return url.href;
    }

    if (opt.pathnameLast) {
      if (url.pathname === '/') url.pathname = '/1';
      if (/\d+$/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/\d+$/, offset.toString());
      } else {
        url.pathname = `${url.pathname}/${offset}`;
      }
      return url.href;
    }

    return url.href;
  };

  public _IS_VIDEO_PAGE = () => {
    if (typeof this.options.IS_VIDEO_PAGE === 'boolean') {
      return this.options.IS_VIDEO_PAGE;
    }
    return this.options.IS_VIDEO_PAGE.test(location.pathname);
  };

  public _IS_SEARCH_PAGE = () => {
    if (typeof this.options.IS_SEARCH_PAGE === 'boolean') {
      return this.options.IS_SEARCH_PAGE;
    }
    return this.options.IS_SEARCH_PAGE.test(location.pathname);
  };

  public _paginationElement = (html = document): HTMLElement => {
    if (typeof this.options.paginationElement === 'function') {
      return this.options.paginationElement(html as unknown as HTMLElement);
    }
    return [...html.querySelectorAll(this.options.paginationElement)].pop() as HTMLElement;
  };

  public CONTAINER = (html = document): HTMLElement => {
    if (typeof this.options.CONTAINER === 'function') {
      return this.options.CONTAINER(html as unknown as HTMLElement);
    }
    return [...html.querySelectorAll(this.options.CONTAINER)].pop() as HTMLElement;
  };

  public THUMB_URL = (thumb: HTMLElement) => {
    if (typeof this.options.THUMB_URL === 'string') {
      return (thumb.querySelector(this.options.THUMB_URL) as HTMLAnchorElement).href || '';
    }
    return this.options.THUMB_URL(thumb);
  };

  public GET_THUMBS = (html: HTMLElement) => {
    if (typeof this.options.GET_THUMBS === 'string') {
      return [...html.querySelectorAll(this.options.GET_THUMBS)] as Array<HTMLElement>;
    }
    return this.options.GET_THUMBS(html);
  };

  public THUMB_DATA = (thumb: HTMLElement): { title: string; duration: number } => {
    const opt = this.options.THUMB_DATA;
    if (typeof opt === 'function') return opt(thumb);

    let title = sanitizeStr((thumb.querySelector(opt.title) as HTMLElement)?.innerText || '');

    if (opt.uploader) {
      const uploader = sanitizeStr(
        (thumb.querySelector(opt.title) as HTMLElement)?.innerText || '',
      );

      title = `${title} user:${uploader}`;
    }

    const duration = !opt.duration
      ? 0
      : timeToSeconds(
          sanitizeStr((thumb.querySelector(opt.duration) as HTMLElement)?.innerText || ''),
        );

    return { title, duration };
  };

  public THUMB_IMG_DATA = (thumb: HTMLElement) => {
    const opt = this.options.THUMB_IMG_DATA;
    if (typeof opt === 'function') return opt(thumb);

    const result = {};

    if (opt.img) {
      const img = thumb.querySelector(opt.img) as HTMLImageElement;
      const imgSrc = img.getAttribute(opt.imgSrc || 'data-src') || img.getAttribute('src');

      if (opt.lazyloading) {
        img.classList.remove(opt.lazyloading);
      }

      Object.assign(result, { img, imgSrc });

      if (img.complete && img.getAttribute('src') && !img.src.includes('data:image')) {
        return {};
      }
    } else return {};
  };
}

// const _3HENTAI_RULES = new RulesHelper({
//   IS_VIDEO_PAGE: /^\/g\/\d+/.test(location.pathname),
//   IS_SEARCH_PAGE: /^\/search\//.test(location.pathname),
//   THUMB_URL: 'a',
//   GET_THUMBS: '.doujin-col',
//   THUMB_DATA: { title: '.title' },
//   THUMB_IMG_DATA: { img: 'img', lazyloading: 'lazy' },
//   paginationUrlGenerator: { searchPage: 'page' },
//   paginationElement: '.pagination',
//   paginationOffset: 1,
//   paginationLast: Math.max(
//     ...Array.from(document.querySelectorAll('.pagination .page-link') || [], (e) =>
//       parseInt((e as HTMLElement).innerText),
//     ).filter(Number),
//     1,
//   ),
//   CONTAINER: '.listing-container',

// /*
//   PARSE LINKS AND PAGINATION FOR IT!!!!

// */


//   URL_DATA() {
//     const IS_SEARCH_PAGE = /^\/search\//.test(location.pathname);
//     const url = new URL(window.location.href);

//     let paginationOffset = parseInt(url.searchParams.get('page') || "1");
//     let paginationUrlGenerator = (offset: number) => {
//       url.searchParams.set('page', offset.toString());
//       return url.href;
//     };

//     if (!IS_SEARCH_PAGE) {
//       paginationOffset = parseInt(url.pathname.match(/\d+$/)?.[0] || "1");
//       if (url.pathname === '/') url.pathname = '/1';
//       paginationUrlGenerator = (offset: number) => {
//         if (/\d+$/.test(url.pathname)) {
//           url.pathname = url.pathname.replace(/\d+$/, offset.toString());
//         } else {
//           url.pathname = `${url.pathname}/${offset}`;
//         }
//         return url.href;
//       };
//     }

//     return { paginationOffset, paginationUrlGenerator };
//   },
//   router: () => {},
// });



// const __NHENTAI_RULES = new RulesHelper({
//   IS_VIDEO_PAGE: /^\/g\/\d+/.test(location.pathname),
//   IS_SEARCH_PAGE: /^\/search\//,
//   THUMB_URL: ".cover",
//   GET_THUMBS: ".gallery",
//   THUMB_DATA: { title: ".caption" },
//   THUMB_IMG_DATA: thumb => {
//     const img = thumb.querySelector(".cover img")
//     let imgSrc = img.getAttribute("data-src") || img.getAttribute("src") || ""
//     if (!/^\/g\/\d+/.test(location.pathname))
//       imgSrc = imgSrc?.replace("t5", "t3")
//     img.classList.remove("lazyload")
//     if (
//       img.complete &&
//       img.getAttribute("src") &&
//       !img.src.includes("data:image")
//     ) {
//       return {}
//     }
//     return { img, imgSrc }
//   },
//   paginationUrlGenerator: { searchPage: "page" },
//   paginationElement: ".pagination",
//   paginationOffset:
//     parseInt(new URL(location.href).searchParams.get("page")) || 1,
//   paginationLast: parseInt(
//     document.querySelector(".pagination .last")?.href.match(/\d+/)?.[0] || "1"
//   ),
//   CONTAINER: ".index-container, .container",
//   router: () => {}
// })
