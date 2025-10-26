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
  const pageLinks = getPaginationLinks(doc, url);

  console.log({ pageLinks });

  const getStrategy = (): typeof PaginationStrategy => {
    const dataParamLinks = Array.from(document.querySelectorAll('[data-parameters *= from]'));
    if (dataParamLinks.length > 0) {
      console.log('PaginationStrategyDataParams', dataParamLinks);
      return PaginationStrategyDataParams;
    }

    if (pageLinks.some((h) => /(page|p)=\d+/.test(h))) {
      const l = pageLinks.filter((h) => /(page|p)=\d+/.test(h));
      console.log('PaginationStrategySearchParams', l);
      return PaginationStrategySearchParams;
    }

    if (pageLinks.some((h) => /\/(page\/)?\d+\/?$/.test(h))) {
      const l = pageLinks.filter((h) => /\/(page\/)?\d+\/?$/.test(h));
      console.log('PaginationStrategyPathnameParams', l);
      return PaginationStrategyPathnameParams;
    }

    console.error('Found No Strategy');
    return PaginationStrategy;
  };

  const paginationStrategy = new (getStrategy())(options);

  return paginationStrategy;
}

// const p = new PaginationStrategyPathnameParams();

// console.table({
//   pagination: `class:${p.getPaginationElement().className} + id:${p.getPaginationElement().id}`,
//   last: p.getPaginationLast(),
//   offset: p.getPaginationOffset(),
//   generator: p.getPaginationUrlGenerator()(1488),
// });
