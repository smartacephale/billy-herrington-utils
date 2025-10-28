import { fetchHtml } from '../../../utils/fetch';
import { PaginationStrategy } from './PaginationStrategy';

interface UnsafeWindow extends Window {
  PAGINATION_NEXT?: string;
}
declare const unsafeWindow: UnsafeWindow;

export class PaginationStrategyTrash extends PaginationStrategy {
  getPaginationLast() {
    return 9999;
  }

  getPaginationOffset() {
    return this.offsetMin;
  }
  
  eHentaiNext = async () => {
    if (!unsafeWindow.PAGINATION_NEXT) {
      const hrefs = [...document.querySelectorAll('a#dnext[href]')] as Array<HTMLAnchorElement>;
      unsafeWindow.PAGINATION_NEXT = hrefs.pop()?.href;
    }
    const doc = await fetchHtml(unsafeWindow.PAGINATION_NEXT as string);
    const hrefs = [...doc.querySelectorAll('a#dnext[href]')] as Array<HTMLAnchorElement>;
    unsafeWindow.PAGINATION_NEXT = hrefs.pop()?.href;
  };

  getPaginationUrlGenerator() {
    const paginationUrlGenerator = (_: number) => {
      this.eHentaiNext();
      return unsafeWindow.PAGINATION_NEXT as string;
    };

    return paginationUrlGenerator;
  }
}
