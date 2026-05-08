/**
 * useFavoritesList — Dexie-backed live list of saved recipes, optionally
 * filtered by a search-within string. Sorted newest-first by `savedAt`.
 *
 * Returns `null` while the first read is in flight (Dexie's useLiveQuery
 * resolves async); routes treat that as a brief loading state and the live
 * value lands within a tick or two.
 */

import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type FavoriteRow } from '@/db';

export function useFavoritesList(query: string): FavoriteRow[] | null {
  const all = useLiveQuery(
    () => db.favorites.orderBy('savedAt').reverse().toArray(),
    [],
    null,
  ) as FavoriteRow[] | null;

  return useMemo(() => {
    if (all === null) return null;
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => r.title.toLowerCase().includes(q));
  }, [all, query]);
}
