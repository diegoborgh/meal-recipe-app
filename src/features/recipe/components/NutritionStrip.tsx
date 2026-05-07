import { formatReadyTime } from '@/lib/format';
import type { Recipe } from '@/types/recipe';
import { Stat } from './Stat';
import { MacroPill } from './MacroPill';
import styles from './NutritionStrip.module.css';

export interface NutritionStripProps {
  recipe: Recipe;
  /** Currently-displayed servings (UI value, may differ from recipe.servings). */
  servings: number;
  /** Pre-formatted ready-time fallback when recipe.time is missing. */
  readyMinutes?: number;
}

/**
 * Per-serving stats + macro pills. Macros are derived from grams via the
 * 4/4/9 kcal-per-gram rule for the progress fill — the absolute g amount
 * is what the user reads, the bar is just a visual proportion.
 */
export function NutritionStrip({
  recipe,
  servings,
  readyMinutes,
}: NutritionStripProps) {
  const { calories, protein, carbs, fat } = recipe.nutrition;
  // Convert grams to kcal contributions, then percentages of the total of those three.
  // Bar lengths are relative to the macro mix, not total calories — so even
  // when calories is null we still get useful proportions.
  const pKcal = (protein ?? 0) * 4;
  const cKcal = (carbs ?? 0) * 4;
  const fKcal = (fat ?? 0) * 9;
  const total = pKcal + cKcal + fKcal || 1;
  const pPct = pKcal / total;
  const cPct = cKcal / total;
  const fPct = fKcal / total;

  const fmtG = (g: number | null) => (g == null ? '—' : `${Math.round(g)}g`);

  return (
    <>
      <div className={styles.stats}>
        <Stat
          label="Time"
          value={recipe.time ?? formatReadyTime(readyMinutes) ?? '—'}
        />
        <Stat label="Servings" value={servings} divider />
        <Stat
          label="Per serving"
          value={calories == null ? '—' : `${Math.round(calories)} kcal`}
          divider
        />
      </div>
      <div className={styles.macros}>
        <MacroPill
          label="Protein"
          value={fmtG(protein)}
          pct={pPct}
          color="var(--color-accent)"
        />
        <MacroPill
          label="Carbs"
          value={fmtG(carbs)}
          pct={cPct}
          color="var(--color-honey)"
        />
        <MacroPill
          label="Fat"
          value={fmtG(fat)}
          pct={fPct}
          color="var(--color-accent-2)"
        />
      </div>
    </>
  );
}
