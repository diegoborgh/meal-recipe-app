import { Icon } from '@/components/Icon';
import styles from './ServingsAdjuster.module.css';

export interface ServingsAdjusterProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 20;

export function ServingsAdjuster({
  value,
  onChange,
  min = DEFAULT_MIN,
  max = DEFAULT_MAX,
}: ServingsAdjusterProps) {
  return (
    <div
      className={styles.wrap}
      role="group"
      aria-label={`Servings: ${value}`}
    >
      <button
        type="button"
        className={styles.btn}
        disabled={value <= min}
        aria-label="Decrease servings"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Icon name="minus" size={14} />
      </button>
      <span className={styles.value}>{value}</span>
      <button
        type="button"
        className={styles.btn}
        disabled={value >= max}
        aria-label="Increase servings"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
