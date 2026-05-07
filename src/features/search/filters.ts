/*
 * Filter <-> URL serialization. The URL is the source of truth for filter
 * state — back/forward and link-sharing both work because of this. Components
 * read `filtersFromSearchParams(searchParams)` and write changes via
 * `setSearchParams(filtersToSearchParams(next))`.
 *
 * URL grammar (compact, human-readable):
 *   ?q=salmon&diet=vegan&intol=dairy,gluten&time=30&type=dinner&kcalMin=200&kcalMax=600&sort=time
 *
 * Unknown values are dropped silently — never trust the URL bar.
 */

import type { SearchSort } from '@/api/search';
import {
  DIETS,
  INTOLERANCES,
  MEAL_TYPES,
  EMPTY_FILTERS,
  type Diet,
  type Filters,
  type Intolerance,
  type MealType,
} from './types';

const SORTS: ReadonlySet<SearchSort> = new Set(['popularity', 'time', 'random']);

function asInt(v: string | null): number | null {
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function asEnum<T extends string>(
  v: string | null,
  options: readonly T[],
): T | null {
  if (!v) return null;
  return options.includes(v as T) ? (v as T) : null;
}

export function filtersFromSearchParams(sp: URLSearchParams): Filters {
  const intolRaw = sp.get('intol');
  const intolerances = intolRaw
    ? intolRaw
        .split(',')
        .map((s) => s.trim())
        .filter((s): s is Intolerance => INTOLERANCES.includes(s as Intolerance))
    : [];

  const sort = sp.get('sort');
  const sortValid: SearchSort = sort && SORTS.has(sort as SearchSort) ? (sort as SearchSort) : 'popularity';

  return {
    query: sp.get('q') ?? '',
    diet: asEnum<Diet>(sp.get('diet'), DIETS),
    intolerances,
    maxReadyTime: asInt(sp.get('time')),
    type: asEnum<MealType>(sp.get('type'), MEAL_TYPES),
    minCalories: asInt(sp.get('kcalMin')),
    maxCalories: asInt(sp.get('kcalMax')),
    sort: sortValid,
  };
}

/**
 * Inverse: produces a URLSearchParams suitable for `setSearchParams`.
 * Empty / default values are omitted to keep the URL short.
 */
export function filtersToSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.query.trim()) sp.set('q', f.query.trim());
  if (f.diet) sp.set('diet', f.diet);
  if (f.intolerances.length > 0) sp.set('intol', f.intolerances.join(','));
  if (f.maxReadyTime != null) sp.set('time', String(f.maxReadyTime));
  if (f.type) sp.set('type', f.type);
  if (f.minCalories != null) sp.set('kcalMin', String(f.minCalories));
  if (f.maxCalories != null) sp.set('kcalMax', String(f.maxCalories));
  if (f.sort !== 'popularity') sp.set('sort', f.sort);
  return sp;
}

/* ── Reducer ───────────────────────────────────────────────────────────── */
/*
 * Filter state would be straightforward as multiple useState calls, but the
 * cross-filter interactions (e.g. "Reset all", "Toggle intolerance") read
 * better as a reducer. Bonus: easier to test pure transitions.
 */

export type FilterAction =
  | { type: 'set_query'; query: string }
  | { type: 'set_diet'; diet: Diet | null }
  | { type: 'toggle_intolerance'; intolerance: Intolerance }
  | { type: 'set_max_time'; minutes: number | null }
  | { type: 'set_meal_type'; mealType: MealType | null }
  | { type: 'set_calorie_range'; min: number | null; max: number | null }
  | { type: 'set_sort'; sort: SearchSort }
  | { type: 'reset' }
  | { type: 'replace'; filters: Filters };

export function filtersReducer(state: Filters, action: FilterAction): Filters {
  switch (action.type) {
    case 'set_query':
      return { ...state, query: action.query };
    case 'set_diet':
      return { ...state, diet: action.diet };
    case 'toggle_intolerance': {
      const has = state.intolerances.includes(action.intolerance);
      return {
        ...state,
        intolerances: has
          ? state.intolerances.filter((x) => x !== action.intolerance)
          : [...state.intolerances, action.intolerance],
      };
    }
    case 'set_max_time':
      return { ...state, maxReadyTime: action.minutes };
    case 'set_meal_type':
      return { ...state, type: action.mealType };
    case 'set_calorie_range':
      return { ...state, minCalories: action.min, maxCalories: action.max };
    case 'set_sort':
      return { ...state, sort: action.sort };
    case 'reset':
      // Preserve the active query — "Reset filters" doesn't clear the search box.
      return { ...EMPTY_FILTERS, query: state.query };
    case 'replace':
      return action.filters;
  }
}
