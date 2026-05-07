import type { ChangeEvent } from 'react';
import { CALORIE_MAX, CALORIE_MIN } from '../types';
import styles from './CalorieSlider.module.css';

export interface CalorieSliderProps {
  /** null = lower bound is unset (treated as CALORIE_MIN visually). */
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
  step?: number;
}

const STEP_DEFAULT = 50;

export function CalorieSlider({ min, max, onChange, step = STEP_DEFAULT }: CalorieSliderProps) {
  // Treat nulls as full range visually but keep the model aware they're unset.
  const lo = min ?? CALORIE_MIN;
  const hi = max ?? CALORIE_MAX;

  const onLo = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), hi - step);
    onChange(v <= CALORIE_MIN ? null : v, max);
  };

  const onHi = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), lo + step);
    onChange(min, v >= CALORIE_MAX ? null : v);
  };

  const loPct = ((lo - CALORIE_MIN) / (CALORIE_MAX - CALORIE_MIN)) * 100;
  const hiPct = ((hi - CALORIE_MIN) / (CALORIE_MAX - CALORIE_MIN)) * 100;
  const isActive = min != null || max != null;

  return (
    <div className={styles.wrap}>
      <div className={styles.track}>
        <div className={styles.trackBg} />
        <div
          className={styles.trackActive}
          style={{ left: `calc(${loPct}% + 6px)`, right: `calc(${100 - hiPct}% + 6px)` }}
        />
        <input
          aria-label="Minimum calories per serving"
          className={styles.range}
          type="range"
          min={CALORIE_MIN}
          max={CALORIE_MAX}
          step={step}
          value={lo}
          onChange={onLo}
        />
        <input
          aria-label="Maximum calories per serving"
          className={styles.range}
          type="range"
          min={CALORIE_MIN}
          max={CALORIE_MAX}
          step={step}
          value={hi}
          onChange={onHi}
        />
      </div>
      <div className={styles.labels}>
        <span>{CALORIE_MIN} kcal</span>
        <span className={isActive ? styles.labelActive : undefined}>
          {lo} — {hi} kcal
        </span>
        <span>{CALORIE_MAX} kcal</span>
      </div>
    </div>
  );
}
