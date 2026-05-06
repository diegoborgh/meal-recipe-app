import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

/**
 * Preferences context — diet defaults, intolerances, calorie target, units.
 * Stub for slice 1; the real provider lands with the Preferences feature
 * (slice 6 per build-prompt.md). Apps that read these fields today get
 * the documented defaults.
 */

export type Units = 'us' | 'metric';

export interface Preferences {
  diets: string[];
  intolerances: string[];
  calorieTarget: number | null;
  units: Units;
}

export const DEFAULT_PREFERENCES: Preferences = {
  diets: [],
  intolerances: [],
  calorieTarget: null,
  units: 'us',
};

interface PreferencesValue {
  preferences: Preferences;
  setPreferences: (p: Preferences) => void;
}

const PreferencesContext = createContext<PreferencesValue>({
  preferences: DEFAULT_PREFERENCES,
  setPreferences: () => {
    /* stub — replaced when the Preferences feature lands */
  },
});

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // Stub provider — does NOT yet read/write Dexie. That arrives with the
  // Preferences slice. Today it just exposes defaults so consumers compile.
  const value: PreferencesValue = {
    preferences: DEFAULT_PREFERENCES,
    setPreferences: () => {
      /* no-op until slice 6 */
    },
  };
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesValue {
  return useContext(PreferencesContext);
}
