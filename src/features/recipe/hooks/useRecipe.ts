/**
 * useRecipe — fetch a full recipe by id with abort + quota handling.
 *
 * Lookup order:
 *   1. Dexie favorites cache. If a `complete: true` row exists, use it
 *      immediately. This is what makes saved recipes work offline.
 *   2. Session cache (in-memory). If we've fetched this id this session,
 *      return the cached recipe — no API call. See src/lib/sessionCache.ts
 *      for rationale (free tier budget + dev-vs-prod parity).
 *   3. Fall through to /api/spoonacular → /recipes/{id}/information.
 *
 * Mirrors useRecipeSearch's error model: 402/429 are surfaced as a separate
 * `quotaExceeded` flag so the route can render the calm error state.
 *
 * No retry-on-mount. `refetch()` evicts the session cache entry and forces
 * a fresh fetch (used by error states' "Try again" button).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getRecipe } from '@/api/recipe';
import { ApiError, QuotaError } from '@/api/client';
import { db } from '@/db';
import { coerceSteps } from '@/db/favorites';
import { cacheKey, evict, getCached, setCached } from '@/lib/sessionCache';
import type { Recipe } from '@/types/recipe';

const CACHE_NS = 'recipe';

export interface UseRecipeState {
  recipe: Recipe | null;
  loading: boolean;
  error: Error | null;
  quotaExceeded: boolean;
  refetch: () => void;
}

const INITIAL: Omit<UseRecipeState, 'refetch'> = {
  recipe: null,
  loading: false,
  error: null,
  quotaExceeded: false,
};

export function useRecipe(id: number | null): UseRecipeState {
  const [state, setState] = useState(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(() => {
    if (id == null) {
      setState(INITIAL);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState((s) => ({ ...s, loading: true, error: null, quotaExceeded: false }));

    // Step 1: Dexie favorites cache.
    db.favorites
      .get(id)
      .then((cached) => {
        if (ac.signal.aborted) return null;
        if (cached && cached.complete) {
          const { savedAt: _savedAt, complete: _complete, ...rest } = cached;
          // Legacy rows may have steps as string[]; coerce to RecipeStep[].
          const recipe: Recipe = { ...rest, steps: coerceSteps(rest.steps) };
          setState({ recipe, loading: false, error: null, quotaExceeded: false });
          return null; // signal: don't fetch
        }
        // Step 2: session cache.
        const sessionCached = getCached<Recipe>(cacheKey(CACHE_NS, { id }));
        if (sessionCached) {
          setState({ recipe: sessionCached, loading: false, error: null, quotaExceeded: false });
          return null;
        }
        return 'fetch';
      })
      .then((next) => {
        if (next !== 'fetch' || ac.signal.aborted) return;
        // Step 3: API.
        return getRecipe(id, { signal: ac.signal }).then((recipe) => {
          if (ac.signal.aborted) return;
          setCached(cacheKey(CACHE_NS, { id }), recipe);
          setState({ recipe, loading: false, error: null, quotaExceeded: false });
        });
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setState({
          recipe: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
          quotaExceeded: err instanceof QuotaError,
        });
        if (!(err instanceof QuotaError) && !(err instanceof ApiError)) {
          // eslint-disable-next-line no-console
          console.error('[useRecipe]', err);
        }
      });
  }, [id]);

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
  }, [run]);

  const refetch = useCallback(() => {
    if (id != null) evict(cacheKey(CACHE_NS, { id }));
    run();
  }, [id, run]);

  return { ...state, refetch };
}
