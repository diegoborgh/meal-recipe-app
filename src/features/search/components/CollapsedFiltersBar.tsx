import type { Dispatch } from 'react';
import { Chip } from '@/components/Chip';
import {
  activeFilterCount,
  type Diet,
  type Filters,
  type Intolerance,
} from '../types';
import type { FilterAction } from '../filters';
import styles from './CollapsedFiltersBar.module.css';

export interface CollapsedFiltersBarProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
  /** Diet from preferences. Surfaced as a locked (non-removable) chip when no per-search diet is set. */
  lockedDiet?: Diet | null;
  /** Intolerances from preferences — always shown without a remove ×. */
  lockedIntolerances?: readonly Intolerance[];
  /** Fired by the trailing "Edit all" link — re-expands the desktop sidebar. */
  onEditAll: () => void;
}

/**
 * Inline active-filter readout shown in the results column when the desktop
 * filter sidebar is collapsed. Chip rendering mirrors `ActiveFilterChips` but
 * the framing is different: "FILTERS" label prefix + trailing "Edit all" link
 * instead of a leading "Filters · N" chip.
 *
 * Renders nothing when the user has no active filters and no locked-from-prefs
 * filters — there's nothing to read out.
 */
export function CollapsedFiltersBar({
  filters,
  dispatch,
  lockedDiet,
  lockedIntolerances = [],
  onEditAll,
}: CollapsedFiltersBarProps) {
  const hasAny =
    activeFilterCount(filters) > 0 ||
    (!filters.diet && !!lockedDiet) ||
    lockedIntolerances.length > 0;
  if (!hasAny) return null;

  const calorieLabel = (() => {
    if (filters.minCalories == null && filters.maxCalories == null) return null;
    const a = filters.minCalories ?? '';
    const b = filters.maxCalories ?? '';
    if (a && b) return `${a}–${b} kcal`;
    if (a) return `≥ ${a} kcal`;
    return `≤ ${b} kcal`;
  })();

  const showLockedDiet = !filters.diet && lockedDiet;

  return (
    <div className={styles.row}>
      <span className={styles.label}>Filters</span>

      {filters.maxReadyTime != null && (
        <Chip
          active
          onRemove={() => dispatch({ type: 'set_max_time', minutes: null })}
        >
          Under {filters.maxReadyTime} min
        </Chip>
      )}

      {filters.diet ? (
        <Chip active onRemove={() => dispatch({ type: 'set_diet', diet: null })}>
          {filters.diet}
        </Chip>
      ) : showLockedDiet ? (
        <Chip active disabled title="Default from your preferences">
          {lockedDiet}
        </Chip>
      ) : null}

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

      <button type="button" className={styles.editAll} onClick={onEditAll}>
        Edit all
      </button>
    </div>
  );
}
