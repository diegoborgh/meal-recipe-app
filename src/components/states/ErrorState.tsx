import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import { Button } from '../Button';
import styles from './states.module.css';

export interface ErrorStateProps {
  title?: string;
  body?: ReactNode;
  /** When provided, renders a Try-again button. */
  onRetry?: () => void;
}

/** Calm, not alarming. Use for API errors and 402/429 quota responses. */
export function ErrorState({
  title = 'Something’s off',
  body = 'We couldn’t load this just now. Give it another try in a moment.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.frame} role="alert">
      <div className={styles.iconBubble}>
        <Icon name="info" size={28} />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.body}>{body}</div>
      {onRetry && (
        <div className={styles.actions}>
          <Button onClick={onRetry} leadIcon="undo" variant="outline">
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
