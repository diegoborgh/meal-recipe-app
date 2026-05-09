import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import styles from './CalorieGoalSlider.module.css';

const MIN = 1200;
const MAX = 3500;
const STEP = 50;
const DEFAULT_WHEN_ENABLING = 2100;

export interface CalorieGoalSliderProps {
  /** null = goal not set. */
  value: number | null;
  onChange: (next: number | null) => void;
  /** Debounce window for slider drags before firing onChange. Defaults 200ms. */
  debounceMs?: number;
}

/**
 * Single-thumb calorie target slider. Drags are debounced before firing
 * onChange — the parent writes to Dexie on every change, and we don't need
 * to land 50 writes during one slider drag.
 *
 * "Off" state: when value=null, show "—" and a "Set a goal" button. Tapping
 * the button initializes the value to DEFAULT_WHEN_ENABLING.
 */
export function CalorieGoalSlider({
  value,
  onChange,
  debounceMs = 200,
}: CalorieGoalSliderProps) {
  const [draft, setDraft] = useState<number>(value ?? DEFAULT_WHEN_ENABLING);
  const debounceRef = useRef<number | null>(null);

  // Sync external value changes.
  useEffect(() => {
    setDraft(value ?? DEFAULT_WHEN_ENABLING);
  }, [value]);

  // Debounced commit. Cancels prior pending writes when the user keeps dragging.
  const commit = (next: number) => {
    setDraft(next);
    if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      onChange(next);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    };
  }, []);

  if (value == null) {
    return (
      <div className={styles.toggle}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(DEFAULT_WHEN_ENABLING)}
        >
          Set a goal
        </Button>
      </div>
    );
  }

  const pct = ((draft - MIN) / (MAX - MIN)) * 100;

  return (
    <div className={styles.row}>
      <div className={styles.track}>
        <div className={styles.trackBg} />
        <div className={styles.trackActive} style={{ width: `${pct}%` }} />
        <input
          aria-label="Daily calorie goal"
          type="range"
          className={styles.input}
          min={MIN}
          max={MAX}
          step={STEP}
          value={draft}
          onChange={(e) => commit(Number(e.target.value))}
        />
      </div>
      <span className={styles.value}>{draft.toLocaleString()} kcal</span>
      <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
        Clear
      </Button>
    </div>
  );
}
