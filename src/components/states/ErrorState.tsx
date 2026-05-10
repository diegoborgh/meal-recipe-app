import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import { Button } from '../Button';
import styles from './states.module.css';

export interface ErrorStateProps {
  title?: string;
  body?: ReactNode;
  /** When provided, renders the default "Try again" button. */
  onRetry?: () => void;
  /**
   * Custom primary action — overrides the default Try-again button when set.
   * Useful for offline / quota states where the right action isn't a retry.
   */
  action?: {
    label: string;
    icon?: IconName;
    onClick: () => void;
  };
}

/** Calm, not alarming. Use for API errors and 402/429 quota responses. */
export function ErrorState({
  title = 'Something’s off',
  body = 'We couldn’t load this just now. Give it another try in a moment.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.frame} role="alert">
      <div className={styles.iconBubble}>
        <Icon name="info" size={28} />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
      {(action || onRetry) && (
        <div className={styles.actions}>
          {action ? (
            <Button
              onClick={action.onClick}
              {...(action.icon ? { leadIcon: action.icon } : {})}
              variant="outline"
            >
              {action.label}
            </Button>
          ) : (
            <Button onClick={onRetry} leadIcon="undo" variant="outline">
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
