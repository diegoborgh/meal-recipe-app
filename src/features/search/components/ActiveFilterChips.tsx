import type { Dispatch } from 'react';
import { Chip } from '@/components/Chip';
import { activeFilterCount, type Filters } from '../types';
import type { FilterAction } from '../filters';
import styles from './ActiveFilterChips.module.css';

export interface ActiveFilterChipsProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
  onOpenFilters: () => void;
}

/**
 * Read-out of currently-applied filters, each removable via the chip ×.
 * Always shows the leading "Filters" chip with a count — primary affordance
 * for opening the editor.
 */
export function ActiveFilterChips({
  filters,
  dispatch,
  onOpenFilters,
}: ActiveFilterChipsProps) {
  const count = activeFilterCount(filters);
  const calorieLabel = (() => {
    if (filters.minCalories == null && filters.maxCalories == null) return null;
    const a = filters.minCalories ?? '';
    const b = filters.maxCalories ?? '';
    if (a && b) return `${a}–${b} kcal`;
    if (a) return `≥ ${a} kcal`;
    return `≤ ${b} kcal`;
  })();

  return (
    <div className={styles.row}>
      <Chip leadIcon="filter" active={count > 0} onClick={onOpenFilters}>
        {count > 0 ? String(count) : 'Filters'}
      </Chip>
      {filters.maxReadyTime != null && (
        <Chip
          active
          onRemove={() => dispatch({ type: 'set_max_time', minutes: null })}
        >
          Under {filters.maxReadyTime} min
        </Chip>
      )}
      {filters.diet && (
        <Chip active onRemove={() => dispatch({ type: 'set_diet', diet: null })}>
          {filters.diet}
        </Chip>
      )}
      {filters.intolerances.map((i) => (
        <Chip
          key={i}
          active
          onRemove={() => dispatch({ type: 'toggle_intolerance', intolerance: i })}
        >
          No {i.toLowerCase()}
        </Chip>
      ))}
      {filters.type && (
        <Chip active onRemove={() => dispatch({ type: 'set_meal_type', mealType: null })}>
          {filters.type}
        </Chip>
      )}
      {calorieLabel && (
        <Chip
          active
          onRemove={() =>
            dispatch({ type: 'set_calorie_range', min: null, max: null })
          }
        >
          {calorieLabel}
        </Chip>
      )}
    </div>
  );
}
