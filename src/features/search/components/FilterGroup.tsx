import type { ReactNode } from 'react';
import styles from './FilterGroup.module.css';

export function FilterLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

export function FilterGroup({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div>
      <FilterLabel>{label}</FilterLabel>
      <div className={styles.group}>{children}</div>
    </div>
  );
}
