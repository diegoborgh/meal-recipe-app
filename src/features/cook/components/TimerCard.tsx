import { Icon } from '@/components/Icon';
import styles from './TimerCard.module.css';

export interface TimerCardProps {
  /** Whole minutes pulled from `step.length`. */
  durationMinutes: number;
  /** No-op for slice 1; wired up in slice 2. */
  onStart?: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Optional countdown card mounted under the current Cook Mode step when
 * Spoonacular surfaces a `step.length`. Slice 1: idle visual state only —
 * Start button is non-functional. Live countdown lands in slice 2.
 */
export function TimerCard({ durationMinutes, onStart }: TimerCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>
        <Icon name="timer" size={13} aria-label="timer" />
        <span>Optional timer · {durationMinutes} min</span>
      </div>
      <button
        type="button"
        className={styles.button}
        onClick={onStart}
        aria-label={`Start ${durationMinutes} minute timer`}
      >
        Start {durationMinutes}:{pad(0)}
      </button>
    </div>
  );
}
