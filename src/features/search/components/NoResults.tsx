import type { Dispatch } from 'react';
import { SkilletMark } from '@/components/SkilletMark';
import type { Filters } from '../types';
import type { FilterAction } from '../filters';
import styles from './NoResults.module.css';

export interface NoResultsProps {
  filters: Filters;
  dispatch: Dispatch<FilterAction>;
}

interface Suggestion {
  label: string;
  apply: () => void;
}

/**
 * Friendly empty state. We don't try to be clever — just offer to drop the
 * most-likely-too-restrictive filter (in priority order: time → diet → type).
 */
export function NoResults({ filters, dispatch }: NoResultsProps) {
  const suggestions: Suggestion[] = [];

  if (filters.maxReadyTime != null) {
    suggestions.push({
      label: `Drop the ${filters.maxReadyTime}-min limit`,
      apply: () => dispatch({ type: 'set_max_time', minutes: null }),
    });
  }
  if (filters.diet) {
    suggestions.push({
      label: `Drop "${filters.diet}"`,
      apply: () => dispatch({ type: 'set_diet', diet: null }),
    });
  }
  if (filters.type) {
    suggestions.push({
      label: `Drop "${filters.type}"`,
      apply: () => dispatch({ type: 'set_meal_type', mealType: null }),
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      label: 'Reset all filters',
      apply: () => dispatch({ type: 'reset' }),
    });
  }

  return (
    <div className={styles.frame}>
      <SkilletMark size={96} color="var(--color-honey)" />
      <h2 className={styles.title}>
        Hmm, nothing’s matching{' '}
        <em style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>all</em>{' '}
        of those.
      </h2>
      <p className={styles.body}>
        That combination is a tough order. Want to loosen one?
      </p>
      <div className={styles.suggestions}>
        {suggestions.map((s, i) => (
          <button key={i} type="button" className={styles.suggestion} onClick={s.apply}>
            <span className={styles.suggestionLabel}>{s.label}</span>
            <span className={styles.suggestionHint}>Try again →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
