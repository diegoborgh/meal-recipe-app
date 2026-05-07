/*
 * useAutocomplete — debounced type-ahead suggestions for the search input.
 * 0.1 pt per call but very chatty without debounce; 200ms is the floor before
 * users notice lag.
 */

import { useEffect, useRef, useState } from 'react';
import { autocompleteRecipes } from '@/api/search';
import type { SpoonacularAutocompleteHit } from '@/types/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export interface AutocompleteState {
  suggestions: SpoonacularAutocompleteHit[];
  loading: boolean;
}

export function useAutocomplete(query: string, enabled = true): AutocompleteState {
  const debounced = useDebouncedValue(query, 200);
  const [state, setState] = useState<AutocompleteState>({ suggestions: [], loading: false });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const trimmed = debounced.trim();

    if (!enabled || trimmed.length < 2) {
      setState({ suggestions: [], loading: false });
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;
    setState((s) => ({ ...s, loading: true }));

    autocompleteRecipes(trimmed, 8, { signal: ac.signal })
      .then((hits) => {
        if (ac.signal.aborted) return;
        setState({ suggestions: hits, loading: false });
      })
      .catch((err) => {
        if (ac.signal.aborted) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Autocomplete is non-critical — fail quietly.
        setState({ suggestions: [], loading: false });
      });

    return () => ac.abort();
  }, [debounced, enabled]);

  return state;
}
