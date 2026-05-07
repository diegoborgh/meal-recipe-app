import { useState } from 'react';
import type { Units } from '@/context/PreferencesContext';
import { formatAmount, scaleAmount } from '@/lib/format';
import type { RecipeIngredient } from '@/types/recipe';
import { IngredientRow } from './IngredientRow';
import styles from './IngredientsList.module.css';

export interface IngredientsListProps {
  ingredients: RecipeIngredient[];
  /** Source-of-truth servings count (from the recipe). */
  originalServings: number;
  /** Currently-displayed servings; UI scales amounts proportionally. */
  servings: number;
  units: Units;
}

export function IngredientsList({
  ingredients,
  originalServings,
  servings,
  units,
}: IngredientsListProps) {
  // Manual check-off state. Lives here so it survives ingredient re-renders
  // when servings/units change. Keyed by ingredient id.
  const [checked, setChecked] = useState<ReadonlySet<number>>(() => new Set());
  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (ingredients.length === 0) {
    return (
      <div className={styles.list}>
        <div className={styles.empty}>No ingredients listed for this recipe.</div>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {ingredients.map((ing, i) => {
        const measure = units === 'metric' ? ing.amount.metric : ing.amount.us;
        const scaled = scaleAmount(measure.value, originalServings, servings);
        return (
          <IngredientRow
            key={ing.id || `${ing.name}-${i}`}
            name={ing.name}
            amount={formatAmount(scaled)}
            unit={measure.unit}
            checked={checked.has(ing.id)}
            onToggle={() => toggle(ing.id)}
            divider={i > 0}
          />
        );
      })}
    </div>
  );
}
