import { InfiniteScroller } from '../infinite-scroll';
import type { IRules } from '../rules';

export interface JabroniStore {
  state: Record<string, boolean | string | number>;
  localState: Record<string, boolean | string | number>;
  subscribe: (callback: () => void) => void;
}

export function createInfiniteScroller(
  store: JabroniStore,
  parseData: (document: HTMLElement) => void,
  rules: IRules,
) {
  const enabled = store.state.infiniteScrollEnabled as boolean;

  const paginationOffset = rules.paginationStrategy.getPaginationOffset();
  const paginationElement = rules.paginationStrategy.getPaginationElement() as HTMLElement;
  const paginationLast = rules.paginationStrategy.getPaginationLast();
  const paginationUrlGenerator = rules.paginationStrategy.getPaginationUrlGenerator();

  const iscroller = new InfiniteScroller({
    enabled,
    parseData,
    paginationLast,
    paginationOffset,
    paginationElement,
    paginationUrlGenerator,
    ...rules,
  }).onScroll(({ paginationLast, paginationOffset }) => {
    store.localState.pagIndexLast = paginationLast;
    store.localState.pagIndexCur = paginationOffset;
  }, true);

  store.subscribe(() => {
    iscroller.enabled = store.state.infiniteScrollEnabled as boolean;
  });

  return iscroller;
}
