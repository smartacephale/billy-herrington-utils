import type { PaginationStrategy } from '../pagination-parsing/pagination-strategies';

export interface IRules {
  paginationStrategy: PaginationStrategy;
  delay?: number;
}
