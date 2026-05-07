/**
 * useRecipe — fetch a full recipe by id with abort + quota handling.
 *
 * Mirrors useRecipeSearch's error model: 402/429 are surfaced as a separate
 * `quotaExceeded` flag so the route can render the calm error state.
 *
 * No retry-on-mount. Stale-while-revalidate happens at the edge cache (24h);
 * when the user navigates away and back, browser cache + edge serve fast.
 */

import { useEffect, useRef, useState } from 'react';
import { getRecipe } from '@/api/recipe';
import { ApiError, QuotaError } from '@/api/client';
import type { Recipe } from '@/types/recipe';

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

  const run = () => {
    if (id == null) {
      setState(INITIAL);
      return;
    }
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setState((s) => ({ ...s, loading: true, error: null, quotaExceeded: false }));

    getRecipe(id, { signal: ac.signal })
      .then((recipe) => {
        if (ac.signal.aborted) return;
        setState({ recipe, loading: false, error: null, quotaExceeded: false });
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
  };

  useEffect(() => {
    run();
    return () => abortRef.current?.abort();
    // run is intentionally stable per id — recreate on id change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { ...state, refetch: run };
}
