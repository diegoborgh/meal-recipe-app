import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './states.module.css';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: ReactNode;
  actions?: ReactNode;
}

/** Generic empty state. Feature-specific empty states wrap this with custom copy. */
export function EmptyState({ icon = 'sparkle', title, body, actions }: EmptyStateProps) {
  return (
    <div className={styles.frame} role="status">
      <div className={styles.iconBubble}>
        <Icon name={icon} size={28} />
      </div>
      <div className={styles.title}>{title}</div>
      {body && <div className={styles.body}>{body}</div>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
