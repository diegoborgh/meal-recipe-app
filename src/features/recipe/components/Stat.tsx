import type { ReactNode } from 'react';
import styles from './Stat.module.css';

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Renders a left divider — use on every Stat after the first in a row. */
  divider?: boolean;
}

export function Stat({ label, value, divider }: StatProps) {
  return (
    <div className={`${styles.stat} ${divider ? styles.divider : ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
