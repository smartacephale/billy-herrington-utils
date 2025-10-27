import { parseURL } from '../pagination-utils';

export interface IPaginationStrategy {
  url?: URL | Location | string;
  doc?: Document | HTMLElement;
  paginationSelector?: string;
  fixPaginationLast?: (n: number, offset?: number) => number;
  pathnameSelector?: RegExp;
  searchParamSelector?: string;
  offsetMin?: number;
}

export class PaginationStrategy {
  public doc = document;
  public url: URL;
  public paginationSelector = '.pagination';
  public searchParamSelector = 'page';
  public pathnameSelector = /\/(\d+)\/?$/;
  public fixPaginationLast?: (n: number, offset?: number) => number;
  public offsetMin = 1;

  constructor(options?: IPaginationStrategy) {
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
    return (_: number) => this.url.href;
  }
}
