/*
 * Search feature types. The Filters shape is the single source of truth for
 * what's filterable in this app. It maps 1:1 to the URL query string and
 * (almost) 1:1 to Spoonacular's complexSearch parameters.
 */

import type { SearchSort } from '@/api/search';

/** Diet options match Spoonacular's accepted values exactly. */
export const DIETS = [
  'Vegetarian',
  'Vegan',
  'Pescetarian',
  'Ketogenic',
  'Paleo',
  'Gluten Free',
] as const;
export type Diet = (typeof DIETS)[number];

export const INTOLERANCES = [
  'Dairy',
  'Egg',
  'Gluten',
  'Peanut',
  'Seafood',
  'Sesame',
  'Shellfish',
  'Soy',
  'Tree Nut',
  'Wheat',
] as const;
export type Intolerance = (typeof INTOLERANCES)[number];

/** Quick "Max time" presets the chip row in the filter sheet exposes. */
export const TIME_PRESETS = [15, 30, 60] as const;

export const MEAL_TYPES = ['Breakfast', 'Lunch', 'Main course', 'Snack', 'Dessert'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/** Calorie slider bounds. Per-serving. */
export const CALORIE_MIN = 100;
export const CALORIE_MAX = 1200;

export interface Filters {
  query: string;
  diet: Diet | null;
  intolerances: Intolerance[];
  /** Max ready time in minutes; null = no limit. */
  maxReadyTime: number | null;
  type: MealType | null;
  minCalories: number | null;
  maxCalories: number | null;
  sort: SearchSort;
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  diet: null,
  intolerances: [],
  maxReadyTime: null,
  type: null,
  minCalories: null,
  maxCalories: null,
  sort: 'popularity',
};

/** Returns the count of "non-default" filters — drives the badge in the chip row. */
export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.diet) n++;
  if (f.intolerances.length > 0) n++;
  if (f.maxReadyTime != null) n++;
  if (f.type) n++;
  if (f.minCalories != null || f.maxCalories != null) n++;
  return n;
}
