import type { CSSProperties } from 'react';
import styles from './MacroPill.module.css';

export interface MacroPillProps {
  label: string;
  /** Pre-formatted, e.g. "32g" or "—" for missing data. */
  value: string;
  /** 0–1; drives the progress bar fill width. */
  pct: number;
  /** Token name or hex for the fill. Defaults to accent. */
  color?: string;
}

export function MacroPill({ label, value, pct, color }: MacroPillProps) {
  const safePct = Math.max(0, Math.min(1, pct));
  const fill = color ?? 'var(--color-accent)';
  return (
    <div className={styles.pill}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      <div className={styles.bar}>
        <div
          className={styles.barFill}
          style={{ width: `${safePct * 100}%`, '--fill-color': fill } as CSSProperties}
        />
      </div>
    </div>
  );
}
