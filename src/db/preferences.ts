/*
 * Preferences row helpers. Single-row table keyed by the literal id 'singleton'
 * (declared in src/db/schema.ts).
 *
 * The provider in src/context/PreferencesContext.tsx is the only consumer —
 * components should read prefs via `usePreferences()`, never hit Dexie directly.
 */

import { db, type PreferencesRow } from './index';

export const PREFS_KEY: 'singleton' = 'singleton';

export const DEFAULT_PREFS: PreferencesRow = {
  id: PREFS_KEY,
  diet: null,
  intolerances: [],
  calorieTarget: null,
  units: 'us',
  updatedAt: 0,
};

export async function loadPreferences(): Promise<PreferencesRow> {
  const row = await db.preferences.get(PREFS_KEY);
  return row ?? DEFAULT_PREFS;
}

export async function savePreferences(
  patch: Partial<Omit<PreferencesRow, 'id' | 'updatedAt'>>,
): Promise<void> {
  const current = await loadPreferences();
  const next: PreferencesRow = {
    ...current,
    ...patch,
    id: PREFS_KEY,
    updatedAt: Date.now(),
  };
  await db.preferences.put(next);
}

export async function clearPreferences(): Promise<void> {
  await db.preferences.delete(PREFS_KEY);
}
