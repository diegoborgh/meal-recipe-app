/*
 * useRecipeSearch — paginated, abortable recipe search.
 *
 * Behavior:
 *   - When `params` change (deep-compared via the serialized filter URL),
 *     the previous request is aborted and we reset.
 *   - `loadMore()` appends the next page; safe to call repeatedly — overlapping
 *     calls are ignored.
 *   - Quota errors (402/429) are surfaced as a separate `quotaExceeded` flag
 *     so the UI can render the calm error state.
 *   - Loads are debounced 250ms internally so typing-as-you-search doesn't
 *     fire a request per keystroke. (The query input also uses useDebouncedValue
 *     before passing in, but this is defense-in-depth.)
 *
 * Session caching:
 *   Successful results (the full SearchState — accumulated pages, totals,
 *   hasMore) are written to src/lib/sessionCache. When the same params come
 *   back into scope (e.g. user clicks Cook → Home), we hydrate from cache
 *   and skip the fetch entirely. Cache lives until tab close.
 *
 *   `refetch()` explicitly evicts and re-fetches — used by error states'
 *   "Try again" button.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchRecipes, type SearchParams } from '@/api/search';
import { ApiError, QuotaError } from '@/api/client';
import { cacheKey, evict, getCached, setCached } from '@/lib/sessionCache';
import type { RecipeSummary } from '@/types/recipe';

const PAGE_SIZE = 12;
const CACHE_NS = 'search';

export interface SearchState {
  results: RecipeSummary[];
  totalResults: number;
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  quotaExceeded: boolean;
  hasMore: boolean;
}

const INITIAL: SearchState = {
  results: [],
  totalResults: 0,
  loading: false,
  loadingMore: false,
  error: null,
  quotaExceeded: false,
  hasMore: false,
};

/** Subset of SearchState that's worth persisting across mounts. */
type CachedState = Pick<SearchState, 'results' | 'totalResults' | 'hasMore'>;

export function useRecipeSearch(
  params: SearchParams,
  /** Skip while empty — used to avoid a fetch when there's nothing to filter on. */
  enabled = true,
): SearchState & { loadMore: () => void; refetch: () => void } {
  const [state, setState] = useState<SearchState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  // Stable identity for the params so the effect deps don't churn on object refs.
  const paramsKey = JSON.stringify(params);

  const fetchPage = useCallback(
    async (offset: number, append: boolean) => {
      // Cancel any in-flight request before starting a new one.
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setState((s) => ({
        ...s,
        loading: !append,
        loadingMore: append,
        error: null,
        quotaExceeded: false,
      }));

      try {
        const page = await searchRecipes(
          { ...params, offset, number: PAGE_SIZE },
          { signal: ac.signal },
        );
        // Bail if a newer request superseded us between await-points.
        if (ac.signal.aborted) return;
        setState((s) => {
          const next: SearchState = {
            ...s,
            results: append ? [...s.results, ...page.results] : page.results,
            totalResults: page.totalResults,
            hasMore: offset + page.results.length < page.totalResults,
            loading: false,
            loadingMore: false,
          };
          // Persist the success path so a later remount with the same params
          // skips the fetch.
          const persisted: CachedState = {
            results: next.results,
            totalResults: next.totalResults,
            hasMore: next.hasMore,
          };
          setCached(cacheKey(CACHE_NS, params), persisted);
          return next;
        });
      } catch (err) {
        if (ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: err instanceof Error ? err : new Error(String(err)),
          quotaExceeded: err instanceof QuotaError,
          // On a hard error after page 1, keep the existing results visible.
          ...(append ? {} : { results: [], totalResults: 0, hasMore: false }),
        }));
        if (!(err instanceof QuotaError) && !(err instanceof ApiError)) {
          // Genuinely unexpected — log so it shows up in DevTools.
          // eslint-disable-next-line no-console
          console.error('[useRecipeSearch]', err);
        }
      }
    },
    // params is captured via paramsKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramsKey],
  );

  // Re-fire on param change. If we have a cached result for these params,
  // hydrate from it and skip the fetch entirely.
  useEffect(() => {
    if (!enabled) {
      setState(INITIAL);
      return;
    }
    const cached = getCached<CachedState>(cacheKey(CACHE_NS, params));
    if (cached) {
      setState({
        ...INITIAL,
        results: cached.results,
        totalResults: cached.totalResults,
        hasMore: cached.hasMore,
      });
      return;
    }
    const id = window.setTimeout(() => {
      void fetchPage(0, false);
    }, 250);
    return () => {
      window.clearTimeout(id);
      abortRef.current?.abort();
    };
    // params captured via paramsKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, enabled, fetchPage]);

  const loadMore = useCallback(() => {
    setState((s) => {
      if (s.loading || s.loadingMore || !s.hasMore) return s;
      void fetchPage(s.results.length, true);
      return s;
    });
  }, [fetchPage]);

  const refetch = useCallback(() => {
    // Explicit refresh: evict so the next fetch lands fresh data.
    evict(cacheKey(CACHE_NS, params));
    void fetchPage(0, false);
    // params captured via paramsKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPage, paramsKey]);

  return { ...state, loadMore, refetch };
}
