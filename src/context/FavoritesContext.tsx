import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * Favorites context — saved recipe IDs, plus mutators.
 * Stub for slice 1; real Dexie-backed provider lands with the Favorites feature
 * (slice 5 per build-prompt.md).
 */

interface FavoritesValue {
  /** Set of saved recipe IDs (Spoonacular ids). */
  ids: ReadonlySet<number>;
  isSaved: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesValue>({
  ids: new Set(),
  isSaved: () => false,
  toggle: async () => {
    /* stub */
  },
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const value: FavoritesValue = {
    ids: new Set(),
    isSaved: () => false,
    toggle: async () => {
      /* no-op until slice 5 */
    },
  };
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  return useContext(FavoritesContext);
}
