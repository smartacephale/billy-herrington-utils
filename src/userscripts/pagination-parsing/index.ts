import {
  type IPaginationStrategy,
  PaginationStrategy,
  PaginationStrategyDataParams,
  PaginationStrategyPathnameParams,
  PaginationStrategySearchParams,
} from './pagination-strategies';
import { getPaginationLinks } from './pagination-utils';

export function getPaginationStrategy(options: IPaginationStrategy) {
  const { doc = document, url = location.href } = options;
  const pageLinks = getPaginationLinks(doc, url).map((l) => new URL(l));

  console.log({ pageLinks: pageLinks.map((l) => l.href) });

  const getStrategy = (): typeof PaginationStrategy => {
    const dataParamLinks = Array.from(document.querySelectorAll('[data-parameters *= from]'));
    if (dataParamLinks.length > 0) {
      console.log('PaginationStrategyDataParams', dataParamLinks);
      return PaginationStrategyDataParams;
    }

    if (pageLinks.some((h) => /(page|p)=\d+/.test(h.search))) {
      const l = pageLinks.filter((h) => /(page|p)=\d+/.test(h.search)).map((h) => h.href);
      console.log('PaginationStrategySearchParams', l);
      return PaginationStrategySearchParams;
    }

    if (pageLinks.some((h) => /\/(page\/)?\d+\/?$/.test(h.pathname))) {
      const l = pageLinks.filter((h) => /\/(page\/)?\d+\/?$/.test(h.pathname)).map((h) => h.href);
      console.log('PaginationStrategyPathnameParams', l);
      return PaginationStrategyPathnameParams;
    }

    console.error('Found No Strategy');
    return PaginationStrategy;
  };

  const paginationStrategy = new (getStrategy())(options);

  return paginationStrategy;
}
