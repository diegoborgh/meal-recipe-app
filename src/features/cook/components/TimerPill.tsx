import { Icon } from '@/components/Icon';
import styles from './TimerPill.module.css';

export interface TimerPillProps {
  /** 1-based step number to display ("Step 3"). */
  stepNumber: number;
  remainingSec: number;
  isDone: boolean;
  /** Tap to jump back to the timer's step. */
  onJump: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function fmtMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Persistent timer pill — rendered above the BottomBar when a timer is
 * running on a different step than the user is currently viewing.
 *
 * Tap → snap back to the timer's step (slice 3's whole point: the timer is
 * useful even when you've advanced to chop while the rice cooks).
 */
export function TimerPill({ stepNumber, remainingSec, isDone, onJump }: TimerPillProps) {
  return (
    <button
      type="button"
      className={`${styles.pill} ${isDone ? styles.done : ''}`}
      onClick={onJump}
      aria-label={
        isDone
          ? `Timer done on step ${stepNumber} — tap to return`
          : `Timer running on step ${stepNumber}, ${fmtMMSS(remainingSec)} remaining — tap to return`
      }
    >
      <Icon name="timer" size={16} aria-label="timer" />
      <span className={styles.time}>{isDone ? 'Done' : fmtMMSS(remainingSec)}</span>
      <Icon name="arrow" size={14} aria-label="" />
      <span className={styles.step}>Step {stepNumber}</span>
    </button>
  );
}
