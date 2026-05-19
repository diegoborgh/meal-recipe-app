/**
 * useFridgeRecipes — fetch recipes that match a committed ingredient list.
 *
 * Triggering: the hook fires whenever the input array changes. The Fridge
 * route holds a *committed* ingredient list separate from the live fridge
 * (driven by an explicit "Find recipes" button), so this hook only sees a
 * change when the user intentionally asks. No internal debounce — the
 * commit flow handles intent.
 *
 * Cache key is the sorted list of ingredient names — committing
 * ["eggs","spinach"] is identical to ["spinach","eggs"], so re-orderings
 * don't pay twice.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  enrichFridgeMatches,
  findRecipesByIngredients,
  type FridgeMatchResult,
} from '@/api/fridge';
import { ApiError, QuotaError } from '@/api/client';
import { cacheKey, evict, getCached, setCached } from '@/lib/sessionCache';

const CACHE_NS = 'fridge';

export interface UseFridgeRecipesState {
  matches: FridgeMatchResult[];
  loading: boolean;
  error: Error | null;
  quotaExceeded: boolean;
  refetch: () => void;
}

const INITIAL: Omit<UseFridgeRecipesState, 'refetch'> = {
  matches: [],
  loading: false,
  error: null,
  quotaExceeded: false,
};

export function useFridgeRecipes(ingredients: string[]): UseFridgeRecipesState {
  const [state, setState] = useState(INITIAL);
  const abortRef = useRef<AbortController | null>(null);
  // Order-stable key: sorting eliminates spurious cache misses.
  const sortedKey = JSON.stringify([...ingredients].sort());

  const run = useCallback(() => {
    if (ingredients.length === 0) {
      setState(INITIAL);
      return;
    }

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const key = cacheKey(CACHE_NS, JSON.parse(sortedKey));
    const cached = getCached<FridgeMatchResult[]>(key);
    if (cached) {
      setState({ matches: cached, loading: false, error: null, quotaExceeded: false });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, quotaExceeded: false }));

    findRecipesByIngredients(ingredients, 20, { signal: ac.signal })
      .then(async (matches) => {
        if (ac.signal.aborted) return;
        // Render matches immediately, then swap in the enriched copy when
        // time + calories arrive. If the bulk call fails (quota, network),
        // the basic matches stay visible.
        setState({ matches, loading: false, error: null, quotaExceeded: false });
        try {
          const enriched = await enrichFridgeMatches(matches, { signal: ac.signal });
          if (ac.signal.aborted) return;
          setCached(key, enriched);
          setState({ matches: enriched, loading: false, error: null, quotaExceeded: false });
        } catch (err) {
          if (ac.signal.aborted) return;
          if (err instanceof DOMException && err.name === 'AbortError') return;
          // Non-fatal: cache the unenriched results so we don't re-pay the
          // findByIngredients cost, and leave the UI as-is.
          setCached(key, matches);
        }
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          matches: [],
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
          quotaExceeded: err instanceof QuotaError,
        });
        if (!(err instanceof QuotaError) && !(err instanceof ApiError)) {
          // eslint-disable-next-line no-console
          console.error('[useFridgeRecipes]', err);
        }
      });
    // ingredients captured via sortedKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedKey]);

  // Fire when the committed ingredient set changes. No debounce — the route
  // gates this via an explicit "Find recipes" button, so every change here
  // is intentional.
  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  const refetch = useCallback(() => {
    evict(cacheKey(CACHE_NS, JSON.parse(sortedKey)));
    run();
  }, [run, sortedKey]);

  return { ...state, refetch };
}
