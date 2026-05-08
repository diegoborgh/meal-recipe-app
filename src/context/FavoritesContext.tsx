/*
 * FavoritesContext — Dexie-backed source of truth for the heart icon and the
 * /favorites route.
 *
 * Reads use `useLiveQuery` (dexie-react-hooks) so any write — from any tab —
 * triggers a re-render. Writes go through `src/db/favorites.ts` helpers so the
 * optimistic-then-upgrade pattern lives in one place.
 *
 * Toggle takes a RecipeSummary (not just an id) because saving requires
 * something to display in the favorites list while the full-recipe upgrade
 * fetch is in flight. Cards already have summary in hand — so this is free.
 *
 * Pending-removal slot: when the user un-hearts a saved recipe, we remove
 * it from Dexie immediately AND stash the row in `pendingRemoval` so the
 * UndoToast can offer to restore it. After ~5s the toast clears and the
 * row is gone for good.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type FavoriteRow } from '@/db';
import {
  removeFavorite,
  restoreFavorite,
  saveFavorite,
} from '@/db/favorites';
import type { RecipeSummary } from '@/types/recipe';

interface FavoritesValue {
  /** Saved Spoonacular ids — fast lookup for heart icons. */
  ids: ReadonlySet<number>;
  isSaved: (id: number) => boolean;
  /**
   * Toggle save state for a recipe. When un-saving, returns the removed row
   * so the caller can offer Undo. When saving, returns null.
   */
  toggle: (summary: RecipeSummary) => Promise<FavoriteRow | null>;
  /** Re-add a previously-removed row (called from the undo toast). */
  restore: (row: FavoriteRow) => Promise<void>;
  /**
   * Most-recent removal awaiting Undo. The provider clears this after a
   * timeout; consumers can also clear manually when the toast dismisses.
   */
  pendingRemoval: FavoriteRow | null;
  clearPendingRemoval: () => void;
}

const UNDO_WINDOW_MS = 5000;

const FavoritesContext = createContext<FavoritesValue>({
  ids: new Set(),
  isSaved: () => false,
  toggle: async () => null,
  restore: async () => {
    /* no-op default */
  },
  pendingRemoval: null,
  clearPendingRemoval: () => {
    /* no-op */
  },
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Live id set. useLiveQuery returns undefined on first render; treat that
  // as "empty" for the predicates and let the actual data hydrate in.
  const ids = useLiveQuery(
    async () => {
      const rows = await db.favorites.toArray();
      return new Set<number>(rows.map((r) => r.id));
    },
    [],
    new Set<number>(),
  );

  const [pendingRemoval, setPendingRemoval] = useState<FavoriteRow | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const clearPendingRemoval = useCallback(() => {
    if (undoTimerRef.current != null) {
      window.clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
    setPendingRemoval(null);
  }, []);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current != null) window.clearTimeout(undoTimerRef.current);
    };
  }, []);

  const isSaved = useCallback((id: number) => ids.has(id), [ids]);

  const toggle = useCallback(
    async (summary: RecipeSummary): Promise<FavoriteRow | null> => {
      if (ids.has(summary.id)) {
        // Removing — capture the row for undo, then schedule its expiry.
        const removed = await removeFavorite(summary.id);
        if (!removed) return null;
        // Replace any prior pending removal with this one (one-at-a-time toast).
        if (undoTimerRef.current != null) window.clearTimeout(undoTimerRef.current);
        setPendingRemoval(removed);
        undoTimerRef.current = window.setTimeout(() => {
          setPendingRemoval(null);
          undoTimerRef.current = null;
        }, UNDO_WINDOW_MS);
        return removed;
      }
      // Adding — save optimistically, kick the background upgrade.
      await saveFavorite(summary);
      // If user is re-saving an item that's currently pending undo, clear
      // the toast — the action is moot.
      if (pendingRemoval?.id === summary.id) clearPendingRemoval();
      return null;
    },
    [ids, pendingRemoval, clearPendingRemoval],
  );

  const restore = useCallback(
    async (row: FavoriteRow) => {
      await restoreFavorite(row);
      clearPendingRemoval();
    },
    [clearPendingRemoval],
  );

  const value = useMemo<FavoritesValue>(
    () => ({
      ids,
      isSaved,
      toggle,
      restore,
      pendingRemoval,
      clearPendingRemoval,
    }),
    [ids, isSaved, toggle, restore, pendingRemoval, clearPendingRemoval],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  return useContext(FavoritesContext);
}
