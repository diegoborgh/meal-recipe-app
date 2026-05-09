/*
 * PreferencesContext — Dexie-backed user preferences.
 *
 * Single-row table; we expose:
 *   - `preferences`: live current value (null until first load completes)
 *   - mutators that auto-save to Dexie on every change
 *   - `clear()` to reset to defaults
 *
 * Auto-save semantics: every mutator immediately writes to Dexie. There is
 * NO Save button. The text input for `calorieTarget` debounces internally
 * (handled at the Route level, not here).
 *
 * Live updates use `useLiveQuery` so a "Clear data" from elsewhere or a
 * cross-tab change refreshes every consumer.
 */

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import {
  DEFAULT_PREFS,
  clearPreferences,
  loadPreferences,
  savePreferences,
} from '@/db/preferences';
import type { PreferencesRow } from '@/db/schema';

export type Units = 'us' | 'metric';

/**
 * The shape consumers see. Identical to the storage row minus the `id` and
 * `updatedAt` housekeeping fields.
 */
export interface Preferences {
  diet: string | null;
  intolerances: string[];
  calorieTarget: number | null;
  units: Units;
}

interface PreferencesValue {
  preferences: Preferences;
  /** True until the first Dexie read resolves. Briefly false after mount. */
  loaded: boolean;
  setDiet: (diet: string | null) => Promise<void>;
  setIntolerances: (intolerances: string[]) => Promise<void>;
  toggleIntolerance: (intolerance: string) => Promise<void>;
  setCalorieTarget: (kcal: number | null) => Promise<void>;
  setUnits: (units: Units) => Promise<void>;
  clear: () => Promise<void>;
}

const noop = async () => {
  /* default — overridden by the provider */
};

const PreferencesContext = createContext<PreferencesValue>({
  preferences: rowToPrefs(DEFAULT_PREFS),
  loaded: false,
  setDiet: noop,
  setIntolerances: noop,
  toggleIntolerance: noop,
  setCalorieTarget: noop,
  setUnits: noop,
  clear: noop,
});

function rowToPrefs(row: PreferencesRow): Preferences {
  return {
    diet: row.diet,
    intolerances: row.intolerances,
    calorieTarget: row.calorieTarget,
    units: row.units,
  };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // useLiveQuery returns `undefined` while the first read is in flight.
  // We treat undefined as "loading" and surface defaults so consumers don't
  // crash — but the `loaded` flag lets callers wait for real data when needed.
  const row = useLiveQuery(loadPreferences, [], undefined);
  const loaded = row !== undefined;
  const preferences: Preferences = useMemo(
    () => rowToPrefs(row ?? DEFAULT_PREFS),
    [row],
  );

  const setDiet = useCallback(async (diet: string | null) => {
    await savePreferences({ diet });
  }, []);

  const setIntolerances = useCallback(async (intolerances: string[]) => {
    await savePreferences({ intolerances });
  }, []);

  const toggleIntolerance = useCallback(
    async (intolerance: string) => {
      const next = preferences.intolerances.includes(intolerance)
        ? preferences.intolerances.filter((x) => x !== intolerance)
        : [...preferences.intolerances, intolerance];
      await savePreferences({ intolerances: next });
    },
    [preferences.intolerances],
  );

  const setCalorieTarget = useCallback(async (kcal: number | null) => {
    await savePreferences({ calorieTarget: kcal });
  }, []);

  const setUnits = useCallback(async (units: Units) => {
    await savePreferences({ units });
  }, []);

  const clear = useCallback(async () => {
    await clearPreferences();
  }, []);

  const value = useMemo<PreferencesValue>(
    () => ({
      preferences,
      loaded,
      setDiet,
      setIntolerances,
      toggleIntolerance,
      setCalorieTarget,
      setUnits,
      clear,
    }),
    [preferences, loaded, setDiet, setIntolerances, toggleIntolerance, setCalorieTarget, setUnits, clear],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  return useContext(PreferencesContext);
}

/**
 * Export every Dexie table as a JSON blob and download it. Plain helper —
 * not a React thing, but lives here because the route's "Export" button is
 * the only consumer.
 */
export async function exportData(): Promise<Blob> {
  const [favorites, prefs, fridge] = await Promise.all([
    db.favorites.toArray(),
    db.preferences.toArray(),
    db.fridge.toArray(),
  ]);
  const payload = {
    schema: 1,
    exportedAt: new Date().toISOString(),
    favorites,
    preferences: prefs,
    fridge,
  };
  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
}

/** Wipe every Dexie table + localStorage. */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.favorites.clear(),
    db.preferences.clear(),
    db.fridge.clear(),
  ]);
}
