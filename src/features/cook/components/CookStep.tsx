import type { RecipeStep } from '@/types/recipe';
import { TimerCard, type TimerCardState } from './TimerCard';
import styles from './CookStep.module.css';

export interface CookStepTimerProps {
  state: TimerCardState;
  remainingSec: number;
  onStart: () => void;
  onStop: () => void;
  onDismiss: () => void;
}

export interface CookStepProps {
  index: number;
  count: number;
  step: RecipeStep;
  recipeTitle: string;
  /** Timer wiring for the current step. Ignored when the step has no duration. */
  timer: CookStepTimerProps;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Spoonacular often returns instructions as one long run-on like
 * "Add the onions and saute until soft.In a small bowl combine the flour."
 * Split on sentence boundaries so each one renders as its own paragraph with
 * breathing room. The lookahead requires an uppercase letter (or optional
 * whitespace + uppercase), so decimals like "1.5 tbsp" don't get split.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=\.)(?=\s*[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The reading area: massive step number + step text. Two layouts via CSS
 * (no JS branching), driven by the 1024px breakpoint.
 *
 * When the step carries a duration, an optional TimerCard renders under the
 * text. Steps without `durationMinutes` show nothing.
 */
export function CookStep({ index, count, step, recipeTitle, timer }: CookStepProps) {
  return (
    <div className={styles.frame}>
      <div className={styles.numberWrap}>
        <div className={styles.number}>
          {pad(index + 1)}
          <span className={`${styles.numberOf} ${styles.mobile}`}>/ {count}</span>
        </div>
        <div className={styles.numberSubtitle}>
          of {count} · {recipeTitle}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.text}>
          {splitSentences(step.text).map((sentence, i) => (
            <p key={i} className={styles.sentence}>
              {sentence}
            </p>
          ))}
        </div>
        {step.durationMinutes != null && (
          <TimerCard
            durationMinutes={step.durationMinutes}
            state={timer.state}
            remainingSec={timer.remainingSec}
            onStart={timer.onStart}
            onStop={timer.onStop}
            onDismiss={timer.onDismiss}
          />
        )}
      </div>
    </div>
  );
}
