import type { ReactNode } from 'react';
import styles from './DietBadge.module.css';

export type DietBadgeTone = 'olive' | 'rose' | 'honey' | 'cream';

export interface DietBadgeProps {
  children: ReactNode;
  tone?: DietBadgeTone;
}

export function DietBadge({ children, tone = 'olive' }: DietBadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
