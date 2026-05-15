import { Icon } from '@/components/Icon';
import styles from './TimerCard.module.css';

export type TimerCardState = 'idle' | 'running' | 'done';

export interface TimerCardProps {
  /** Whole minutes pulled from `step.length`. */
  durationMinutes: number;
  state: TimerCardState;
  /** Only meaningful in 'running' state. */
  remainingSec: number;
  onStart: () => void;
  onStop: () => void;
  onDismiss: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function fmtMMSS(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad(m)}:${pad(s)}`;
}

/**
 * Optional countdown card mounted under the current Cook Mode step when
 * Spoonacular surfaces a `step.length`.
 *
 * Three visual states (all same translucent card, only button label and the
 * top label string change):
 *   - idle:    "Optional timer · N min"  →  Start MM:00
 *   - running: "Timer · N min"           →  MM:SS Stop
 *   - done:    "Timer done"              →  Dismiss
 */
export function TimerCard({
  durationMinutes,
  state,
  remainingSec,
  onStart,
  onStop,
  onDismiss,
}: TimerCardProps) {
  const label =
    state === 'idle'
      ? `Optional timer · ${durationMinutes} min`
      : state === 'running'
        ? `Timer · ${durationMinutes} min`
        : 'Timer done';

  const buttonText =
    state === 'idle'
      ? `Start ${durationMinutes}:${pad(0)}`
      : state === 'running'
        ? `${fmtMMSS(remainingSec)} Stop`
        : 'Dismiss';

  const buttonAria =
    state === 'idle'
      ? `Start ${durationMinutes} minute timer`
      : state === 'running'
        ? `Stop timer, ${fmtMMSS(remainingSec)} remaining`
        : 'Dismiss timer';

  const handleClick =
    state === 'idle' ? onStart : state === 'running' ? onStop : onDismiss;

  return (
    <div className={styles.card} data-state={state}>
      <div className={styles.label}>
        <Icon name="timer" size={13} aria-label="timer" />
        <span>{label}</span>
      </div>
      <button
        type="button"
        className={styles.button}
        onClick={handleClick}
        aria-label={buttonAria}
      >
        {buttonText}
      </button>
    </div>
  );
}
