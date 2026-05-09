import type { ReactNode } from 'react';
import styles from './PrefGroup.module.css';

export interface PrefGroupProps {
  label: ReactNode;
  hint?: ReactNode;
  /** When true, wraps children in a flex chip-row container. */
  chips?: boolean;
  children: ReactNode;
}

/**
 * Single labeled preference section. Tighter spacing than FilterGroup since
 * Preferences screen has more groups stacked vertically.
 */
export function PrefGroup({ label, hint, chips, children }: PrefGroupProps) {
  return (
    <div className={styles.group}>
      <div className={styles.head}>
        <span className={styles.label}>{label}</span>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      {chips ? <div className={styles.chips}>{children}</div> : children}
    </div>
  );
}
