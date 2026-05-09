/*
 * FridgeContext — Dexie-backed user pantry state. The list of "what's in
 * my fridge" is shared across:
 *   - the Fridge route (driving the chip input + recipe matches)
 *   - the Recipe Detail page (slice 7+: highlighting ingredients you have)
 *
 * Reads via useLiveQuery so writes (from any route or tab) refresh consumers.
 */

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import {
  addIngredient,
  normalizeIngredient,
  removeIngredient,
} from '@/db/fridge';

interface FridgeValue {
  /** Ingredient names in add-order (lowercase). */
  names: string[];
  /** Quick existence check; uses normalized comparison. */
  has: (name: string) => boolean;
  add: (name: string, spoonacularId?: number | null) => Promise<void>;
  remove: (name: string) => Promise<void>;
  /** True until the first Dexie read resolves. */
  loaded: boolean;
}

const FridgeContext = createContext<FridgeValue>({
  names: [],
  has: () => false,
  add: async () => {
    /* no-op default */
  },
  remove: async () => {
    /* no-op default */
  },
  loaded: false,
});

export function FridgeProvider({ children }: { children: ReactNode }) {
  const rows = useLiveQuery(
    () => db.fridge.orderBy('addedAt').toArray(),
    [],
    undefined,
  );
  const loaded = rows !== undefined;
  const names = useMemo(() => (rows ?? []).map((r) => r.name), [rows]);
  const nameSet = useMemo(() => new Set(names), [names]);

  const has = useCallback(
    (name: string) => nameSet.has(normalizeIngredient(name)),
    [nameSet],
  );

  const add = useCallback(
    (name: string, spoonacularId: number | null = null) =>
      addIngredient(name, spoonacularId),
    [],
  );

  const remove = useCallback((name: string) => removeIngredient(name), []);

  const value = useMemo<FridgeValue>(
    () => ({ names, has, add, remove, loaded }),
    [names, has, add, remove, loaded],
  );

  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

export function useFridge(): FridgeValue {
  return useContext(FridgeContext);
}
