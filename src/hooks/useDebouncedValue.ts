import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value`. Used for autocomplete + search-as-you-type
 * to avoid hammering the proxy on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
