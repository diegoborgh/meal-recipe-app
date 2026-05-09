import type { Dispatch } from 'react';
import { Chip } from '@/components/Chip';
import {
  DIETS,
  INTOLERANCES,
  MEAL_TYPES,
  TIME_PRESETS,
  type Diet,
  type Filters,
  type Intolerance,
} from '../types';
import type { FilterAction } from '../filters';
import { FilterGroup, FilterLabel } from './FilterGroup';
import { CalorieSlider } from './CalorieSlider';
import styles from './FiltersPanel.module.css';

export interface FiltersPanelProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
  /** Diet from preferences. Used as default when filters.diet is null. */
  lockedDiet?: Diet | null;
  /** Intolerances from preferences — always applied; chips are un-toggleable. */
  lockedIntolerances?: readonly Intolerance[];
}

/**
 * Filter controls. The shared body of both the mobile bottom sheet and the
 * desktop sidebar — same controls, same state, two chrome variants.
 *
 * Preferences-locked values:
 *   - `lockedDiet`: shown active when filters.diet is null. The user can pick
 *     a different diet (which overrides for this search) but clicking "Any"
 *     reverts to the locked default rather than disabling diet entirely.
 *   - `lockedIntolerances`: always shown active and disabled — the user can
 *     ADD more intolerances ad-hoc but cannot un-set the locked ones from a
 *     filter. Locked decision: hard filter, never overridden.
 */
export function FiltersPanel({
  filters,
  dispatch,
  lockedDiet,
  lockedIntolerances = [],
}: FiltersPanelProps) {
  // Effective diet shown active in the chip row — per-search overrides the
  // pref. When neither set, "Any" is active.
  const effectiveDiet = filters.diet ?? lockedDiet ?? null;

  return (
    <div className={styles.panel}>
      <FilterGroup label={lockedDiet ? 'Diet (default from preferences)' : 'Diet'}>
        <Chip
          active={effectiveDiet === null}
          onClick={() => dispatch({ type: 'set_diet', diet: null })}
        >
          Any
        </Chip>
        {DIETS.map((d) => (
          <Chip
            key={d}
            active={effectiveDiet === d}
            onClick={() =>
              dispatch({
                type: 'set_diet',
                // Toggle to null only if user is actively turning off a per-search override;
                // otherwise picking the same value as the locked default leaves it set.
                diet: filters.diet === d ? null : d,
              })
            }
          >
            {d}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup
        label={
          lockedIntolerances.length > 0
            ? 'Avoid (locked from preferences) + extras'
            : 'Avoid (intolerances)'
        }
      >
        {INTOLERANCES.map((i) => {
          const fromPrefs = lockedIntolerances.includes(i);
          const fromFilter = filters.intolerances.includes(i);
          return (
            <Chip
              key={i}
              active={fromPrefs || fromFilter}
              disabled={fromPrefs}
              title={fromPrefs ? 'Locked from your preferences' : undefined}
              onClick={() => {
                if (fromPrefs) return; // un-toggleable
                dispatch({ type: 'toggle_intolerance', intolerance: i });
              }}
            >
              {i}
            </Chip>
          );
        })}
      </FilterGroup>

      <FilterGroup label="Max ready time">
        {TIME_PRESETS.map((t) => (
          <Chip
            key={t}
            active={filters.maxReadyTime === t}
            onClick={() =>
              dispatch({
                type: 'set_max_time',
                minutes: filters.maxReadyTime === t ? null : t,
              })
            }
          >
            {t} min
          </Chip>
        ))}
        <Chip
          active={filters.maxReadyTime === null}
          onClick={() => dispatch({ type: 'set_max_time', minutes: null })}
        >
          Any
        </Chip>
      </FilterGroup>

      <FilterGroup label="Meal type">
        {MEAL_TYPES.map((t) => (
          <Chip
            key={t}
            active={filters.type === t}
            onClick={() =>
              dispatch({
                type: 'set_meal_type',
                mealType: filters.type === t ? null : t,
              })
            }
          >
            {t}
          </Chip>
        ))}
      </FilterGroup>

      <div>
        <FilterLabel>Calories per serving</FilterLabel>
        <CalorieSlider
          min={filters.minCalories}
          max={filters.maxCalories}
          onChange={(min, max) =>
            dispatch({ type: 'set_calorie_range', min, max })
          }
        />
      </div>
    </div>
  );
}
