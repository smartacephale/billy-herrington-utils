import {
  type IPaginationStrategy,
  PaginationStrategy,
  PaginationStrategyDataParams,
  PaginationStrategyPathnameParams,
  PaginationStrategySearchParams,
} from './pagination-strategies';
import { getPaginationLinks, parseURL, upgradePathname } from './pagination-utils';

export function getPaginationStrategy(options: IPaginationStrategy): PaginationStrategy {
  const { doc = document, url = location.href, paginationSelector = '.pagination' } = options;

  const pagination = doc.querySelector(paginationSelector);

  if (!pagination) {
    console.error('Found No Pagination');
    return new PaginationStrategy(options);
  }

  const pageLinks = getPaginationLinks(pagination, url).map((l) => new URL(l));

  console.log({ pageLinks: pageLinks.map((l) => l.href) });

  const getStrategy = (): typeof PaginationStrategy => {
    const dataParamLinks = Array.from(pagination.querySelectorAll('[data-parameters *= from]'));
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
      const pathnameMatched = pageLinks.filter((h) => /\/(page\/)?\d+\/?$/.test(h.pathname));
      console.log(
        'PaginationStrategyPathnameParams',
        pathnameMatched.map((h) => h.href),
      );
      options.url = upgradePathname(parseURL(url), pathnameMatched);
      return PaginationStrategyPathnameParams;
    }

    console.error('Found No Strategy');
    return PaginationStrategy;
  };

  const paginationStrategy = new (getStrategy())(options);

  console.log('paginationStrategy', paginationStrategy);

  return paginationStrategy;
}
