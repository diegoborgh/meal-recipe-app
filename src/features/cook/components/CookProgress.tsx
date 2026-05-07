import styles from './CookProgress.module.css';

export interface CookProgressProps {
  count: number;
  index: number;
  onJump?: (i: number) => void;
}

/**
 * Dots strip showing step progression. Active = wider honey pill, past = small
 * honey, future = dim white. Optional `onJump` lets the user click a dot to
 * skip back/forward; without it, the dots are presentational.
 */
export function CookProgress({ count, index, onJump }: CookProgressProps) {
  return (
    <div
      className={styles.dots}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={index + 1}
      aria-label={`Step ${index + 1} of ${count}`}
    >
      {Array.from({ length: count }).map((_, i) => {
        const className = [
          styles.dot,
          i === index ? styles.dotActive : '',
          i < index ? styles.dotPast : '',
        ]
          .filter(Boolean)
          .join(' ');
        if (!onJump) return <span key={i} className={className} />;
        return (
          <button
            key={i}
            type="button"
            className={className}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => onJump(i)}
          />
        );
      })}
    </div>
  );
}
