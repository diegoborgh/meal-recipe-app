import { useState } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import {
  clearAllData,
  exportData,
  usePreferences,
  type Units,
} from '@/context/PreferencesContext';
import { CalorieGoalSlider } from '@/features/preferences/components/CalorieGoalSlider';
import { ConfirmDialog } from '@/features/preferences/components/ConfirmDialog';
import { InstallPrompt } from '@/features/preferences/components/InstallPrompt';
import { PrefGroup } from '@/features/preferences/components/PrefGroup';
import { UnitToggle } from '@/features/recipe/components/UnitToggle';
import { DIETS, INTOLERANCES } from '@/features/search/types';
import styles from './PreferencesRoute.module.css';

/**
 * "Make it yours" — the user's persistent preferences. Every control
 * auto-saves on change; there is no Save button.
 *
 * Out of scope (locked decision): theme picker. Light only for v1; dark mode
 * is v2. The design has a Light/Dark/System chooser; we intentionally don't
 * build it.
 */
export function PreferencesRoute() {
  const {
    preferences,
    setDiet,
    toggleIntolerance,
    setCalorieTarget,
    setUnits,
  } = usePreferences();
  const [confirmClear, setConfirmClear] = useState(false);

  const onExport = async () => {
    const blob = await exportData();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillet-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onClear = async () => {
    await clearAllData();
    setConfirmClear(false);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Make it <em className={styles.titleAccent}>yours</em>
        </h1>
        <p className={styles.subtitle}>
          Saves automatically. Applies to every search.
        </p>
      </header>

      <div className={styles.groups}>
        <PrefGroup label="Diet" chips>
          <Chip
            active={preferences.diet === null}
            onClick={() => void setDiet(null)}
          >
            Any
          </Chip>
          {DIETS.map((d) => (
            <Chip
              key={d}
              active={preferences.diet === d}
              onClick={() =>
                void setDiet(preferences.diet === d ? null : d)
              }
            >
              {d}
            </Chip>
          ))}
        </PrefGroup>

        <PrefGroup
          label="Avoid (always)"
          hint="Applied to every search — even after you change filters"
          chips
        >
          {INTOLERANCES.map((i) => (
            <Chip
              key={i}
              active={preferences.intolerances.includes(i)}
              onClick={() => void toggleIntolerance(i)}
            >
              {i}
            </Chip>
          ))}
        </PrefGroup>

        <PrefGroup
          label="Daily calorie goal"
          hint="Optional · saved for future use"
        >
          <CalorieGoalSlider
            value={preferences.calorieTarget}
            onChange={(n) => void setCalorieTarget(n)}
          />
        </PrefGroup>

        <PrefGroup label="Units">
          <UnitToggle
            value={preferences.units}
            onChange={(u: Units) => void setUnits(u)}
          />
        </PrefGroup>

        {/* Install / iOS-instructions card. Renders nothing on platforms
            with no install path. */}
        <InstallPrompt />
      </div>

      <div className={styles.dataActions}>
        <Button
          variant="outline"
          leadIcon="upload"
          style={{ flex: 1 }}
          onClick={() => void onExport()}
        >
          Export
        </Button>
        <Button
          variant="ghost"
          leadIcon="trash"
          className={styles.danger}
          style={{ flex: 1, color: 'var(--color-danger)' }}
          onClick={() => setConfirmClear(true)}
        >
          Clear data
        </Button>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear everything?"
        body="This removes your saved recipes, fridge, and preferences from this device. Cached recipes won't be available offline anymore. Can't be undone."
        confirmLabel="Yes, clear it"
        cancelLabel="Cancel"
        danger
        onConfirm={() => void onClear()}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
