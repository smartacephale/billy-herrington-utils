import { InfiniteScroller } from '../infinite-scroll';
import type { RulesHelper } from '../userscript-utils/rules';

export interface JabroniStore {
  state: Record<string, boolean | string | number>;
  localState: Record<string, boolean | string | number>;
  subscribe: (callback: () => void) => void;
}

export function createInfiniteScroller(
  store: JabroniStore,
  handleHtmlCallback: (document: HTMLElement) => void,
  rules: RulesHelper,
) {
  const enabled = store.state.infiniteScrollEnabled as boolean;
  const iscroller = new InfiniteScroller({
    enabled,
    handleHtmlCallback,
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
