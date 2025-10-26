import { getPaginationLinks } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

// const fixPaginationLast = (n) => {
//   if difference < 9 = 999
// }
// maybe update doc after scroll to fix issues

export class PaginationStrategyPathnameParams extends PaginationStrategy {
  public pathnameSelector = /\/(\d+)\/?$/;

  extractPage = (a: HTMLAnchorElement | Location | string): number => {
    const href = typeof a === 'string' ? a : a.href;
    const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
    return parseInt(pathname.match(this.pathnameSelector)?.pop() || this.offsetMin.toString());
  };

  getPaginationLast() {
    const links = getPaginationLinks(
      this.getPaginationElement(),
      this.url.href,
      this.pathnameSelector,
    );
    const pages = Array.from(links, this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.fixPaginationLast) return this.fixPaginationLast(lastPage);
    return lastPage;
  }

  getPaginationOffset() {
    return this.extractPage(this.url.href);
  }

  getPaginationUrlGenerator(url_: URL = this.url) {
    const url = new URL(url_.href);

    const pathnameSelectorPlaceholder = this.pathnameSelector
      .toString()
      .replace(/[/|\\|$|?|(|)]+/g, '/');

    if (!this.pathnameSelector.test(url.pathname)) {
      url.pathname = url.pathname
        .concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString()))
        .replace(/\/{2,}/g, '/');
    }

    const paginationUrlGenerator = (offset: number) => {
      url.pathname = url.pathname.replace(
        this.pathnameSelector,
        pathnameSelectorPlaceholder.replace(/d\+/, offset.toString()),
      );
      return url.href;
    };

    return paginationUrlGenerator;
  }
}
