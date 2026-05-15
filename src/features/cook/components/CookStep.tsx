import type { RecipeStep } from '@/types/recipe';
import { TimerCard } from './TimerCard';
import styles from './CookStep.module.css';

export interface CookStepProps {
  index: number;
  count: number;
  step: RecipeStep;
  recipeTitle: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The reading area: massive step number + step text. Two layouts via CSS
 * (no JS branching), driven by the 1024px breakpoint.
 *
 * When the step carries a duration, an optional TimerCard renders under the
 * text. Steps without `durationMinutes` show nothing.
 */
export function CookStep({ index, count, step, recipeTitle }: CookStepProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.numberWrap}>
        <div className={styles.number}>
          {pad(index + 1)}
          <span className={`${styles.numberOf} ${styles.mobile}`}>/{count}</span>
        </div>
        <div className={styles.numberSubtitle}>
          of {count} · {recipeTitle}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.text}>{step.text}</div>
        {step.durationMinutes != null && (
          <TimerCard durationMinutes={step.durationMinutes} />
        )}
      </div>
    </div>
  );
}
