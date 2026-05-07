import type { Dispatch } from 'react';
import { Chip } from '@/components/Chip';
import {
  DIETS,
  INTOLERANCES,
  MEAL_TYPES,
  TIME_PRESETS,
  type Filters,
} from '../types';
import type { FilterAction } from '../filters';
import { FilterGroup, FilterLabel } from './FilterGroup';
import { CalorieSlider } from './CalorieSlider';
import styles from './FiltersPanel.module.css';

export interface FiltersPanelProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
}

/**
 * Filter controls. The shared body of both the mobile bottom sheet and the
 * desktop sidebar — same controls, same state, two chrome variants.
 */
export function FiltersPanel({ filters, dispatch }: FiltersPanelProps) {
  return (
    <div className={styles.panel}>
      <FilterGroup label="Diet">
        <Chip
          active={filters.diet === null}
          onClick={() => dispatch({ type: 'set_diet', diet: null })}
        >
          Any
        </Chip>
        {DIETS.map((d) => (
          <Chip
            key={d}
            active={filters.diet === d}
            onClick={() =>
              dispatch({ type: 'set_diet', diet: filters.diet === d ? null : d })
            }
          >
            {d}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup label="Avoid (intolerances)">
        {INTOLERANCES.map((i) => (
          <Chip
            key={i}
            active={filters.intolerances.includes(i)}
            onClick={() => dispatch({ type: 'toggle_intolerance', intolerance: i })}
          >
            {i}
          </Chip>
        ))}
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
