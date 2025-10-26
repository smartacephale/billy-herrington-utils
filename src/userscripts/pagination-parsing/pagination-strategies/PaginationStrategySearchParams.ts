import { getPaginationLinks } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

export class PaginationStrategySearchParams extends PaginationStrategy {
  public searchParamSelector = 'page';

  getPaginationElement() {
    return (this.doc.querySelector(this.paginationSelector) || this.doc) as HTMLElement;
  }

  extractPage(a: HTMLAnchorElement | Location | URL | string): number {
    const href = typeof a === 'string' ? a : a.href;
    const p = new URL(href).searchParams.get(this.searchParamSelector) as string;
    return parseInt(p) || this.offsetMin;
  }

  getPaginationLast() {
    const links = getPaginationLinks(this.getPaginationElement(), this.url.href).filter((h) =>
      /(page|p)=\d+/.test(h),
    );
    const pages = links.map(this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.fixPaginationLast) return this.fixPaginationLast(lastPage);
    return lastPage;
  }

  getPaginationOffset() {
    if (this.doc === document) {
      return this.extractPage(this.url);
    }
    const link = this.getPaginationElement().querySelector(
      `a.active[href *= "${this.searchParamSelector}="]`,
    ) as HTMLAnchorElement;
    return this.extractPage(link);
  }

  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);

    const paginationUrlGenerator = (offset: number) => {
      url.searchParams.set(this.searchParamSelector, offset.toString());
      return url.href;
    };

    return paginationUrlGenerator;
  }
}
