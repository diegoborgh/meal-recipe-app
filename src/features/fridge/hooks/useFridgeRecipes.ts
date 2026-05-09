/**
 * useFridgeRecipes — fetch recipes that match the user's current fridge
 * contents. Mirrors useRecipeSearch's error/cache model.
 *
 * Cache key is the sorted list of ingredient names — adding "eggs" then
 * "spinach" gives the same key as adding "spinach" then "eggs", so the user
 * doesn't pay twice for an order-shuffled fridge.
 *
 * Debounce: 350ms after a fridge mutation. Lets a user add/remove a few
 * ingredients in a row without firing one API call per chip click.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { findRecipesByIngredients, type FridgeMatchResult } from '@/api/fridge';
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
      .then((matches) => {
        if (ac.signal.aborted) return;
        setCached(key, matches);
        setState({ matches, loading: false, error: null, quotaExceeded: false });
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

  // Debounced fire on fridge change.
  useEffect(() => {
    const id = window.setTimeout(run, 350);
    return () => {
      window.clearTimeout(id);
      abortRef.current?.abort();
    };
  }, [run]);

  const refetch = useCallback(() => {
    evict(cacheKey(CACHE_NS, JSON.parse(sortedKey)));
    run();
  }, [run, sortedKey]);

  return { ...state, refetch };
}
