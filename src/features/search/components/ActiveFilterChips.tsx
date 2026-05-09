import type { Dispatch } from 'react';
import { Chip } from '@/components/Chip';
import {
  activeFilterCount,
  type Diet,
  type Filters,
  type Intolerance,
} from '../types';
import type { FilterAction } from '../filters';
import styles from './ActiveFilterChips.module.css';

export interface ActiveFilterChipsProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
  /** Diet from preferences. When set and filters.diet is null, shown as a locked chip. */
  lockedDiet?: Diet | null;
  /** Intolerances from preferences — always shown without a remove ×. */
  lockedIntolerances?: readonly Intolerance[];
  onOpenFilters: () => void;
}

/**
 * Read-out of currently-applied filters, each removable via the chip ×.
 * Always shows the leading "Filters" chip with a count — primary affordance
 * for opening the editor.
 *
 * Locked-from-prefs chips render without a remove button and with a tooltip
 * pointing to Preferences. Locked decision: intolerances are a hard filter.
 */
export function ActiveFilterChips({
  filters,
  dispatch,
  lockedDiet,
  lockedIntolerances = [],
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

  // Effective diet shown — per-search overrides pref default.
  const showLockedDiet = !filters.diet && lockedDiet;

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

      {/* Diet: per-search wins (removable). Otherwise show locked-from-prefs (no remove). */}
      {filters.diet ? (
        <Chip active onRemove={() => dispatch({ type: 'set_diet', diet: null })}>
          {filters.diet}
        </Chip>
      ) : showLockedDiet ? (
        <Chip active disabled title="Default from your preferences">
          {lockedDiet}
        </Chip>
      ) : null}

      {/* Locked intolerances first, then per-search additions. */}
      {lockedIntolerances.map((i) => (
        <Chip key={`locked-${i}`} active disabled title="Locked from your preferences">
          No {i.toLowerCase()}
        </Chip>
      ))}
      {filters.intolerances
        .filter((i) => !lockedIntolerances.includes(i))
        .map((i) => (
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
