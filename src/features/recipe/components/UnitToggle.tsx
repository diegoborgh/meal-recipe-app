import type { Units } from '@/context/PreferencesContext';
import styles from './UnitToggle.module.css';

export interface UnitToggleProps {
  value: Units;
  onChange: (next: Units) => void;
}

/**
 * US / Metric segmented toggle. Value comes from the recipe-detail caller —
 * which initializes from `preferences.units` (slice 6). The toggle's local
 * state is intentionally NOT preference-bound: a user might want to look at
 * grams for one recipe without changing their default.
 */
export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div className={styles.wrap} role="group" aria-label="Units">
      <button
        type="button"
        className={`${styles.option} ${value === 'us' ? styles.optionActive : ''}`}
        aria-pressed={value === 'us'}
        onClick={() => onChange('us')}
      >
        US
      </button>
      <button
        type="button"
        className={`${styles.option} ${value === 'metric' ? styles.optionActive : ''}`}
        aria-pressed={value === 'metric'}
        onClick={() => onChange('metric')}
      >
        Metric
      </button>
    </div>
  );
}
