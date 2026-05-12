import { Icon } from '@/components/Icon';
import styles from './CookBottomBar.module.css';

export interface CookBottomBarProps {
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Called when "Done" is tapped on the last step. */
  onDone: () => void;
}

/**
 * Back / Next bar. On the last step the Next button becomes "Done" — honey,
 * fires `onDone` instead of `onNext` (the route uses this to navigate back to
 * the recipe).
 */
export function CookBottomBar({
  isFirst,
  isLast,
  onPrev,
  onNext,
  onDone,
}: CookBottomBarProps) {
  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={`${styles.btn} ${styles.back}`}
        disabled={isFirst}
        onClick={onPrev}
      >
        <Icon name="arrowL" size={20} color="#fff" /> Back
      </button>
      {isLast ? (
        <button
          type="button"
          className={`${styles.btn} ${styles.next} ${styles.done}`}
          onClick={onDone}
        >
          Done <Icon name="check" size={22} color="var(--color-bg)" strokeWidth={2.6} />
        </button>
      ) : (
        <button
          type="button"
          className={`${styles.btn} ${styles.next}`}
          onClick={onNext}
        >
          Next <Icon name="arrow" size={22} color="#fff" />
        </button>
      )}
    </div>
  );
}
