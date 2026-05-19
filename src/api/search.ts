/*
 * Search-related API wrappers. Calls the Vercel proxy, narrows the response,
 * and returns app-internal types. Feature code talks to these — never to
 * `callSpoonacular` directly.
 */

import { callSpoonacular, type CallOptions } from './client';
import type {
  SpoonacularAutocompleteHit,
  SpoonacularSearchHit,
  SpoonacularSearchResponse,
} from '@/types/api';
import type { RecipeSummary } from '@/types/recipe';
import { hasCookableSteps, toRecipeSummary } from '@/lib/format';

/** Sort orders we expose. Spoonacular has more; this is the curated set. */
export type SearchSort = 'popularity' | 'time' | 'random';

export interface SearchParams {
  query?: string;
  diet?: string;             // single value (Spoonacular limitation)
  intolerances?: string[];   // multi-select, sent as comma-separated
  type?: string;             // meal type
  maxReadyTime?: number;     // minutes
  minCalories?: number;
  maxCalories?: number;
  sort?: SearchSort;
  /** Page size; design uses 12. Spoonacular default is 10, max 100. */
  number?: number;
  offset?: number;
}

export interface SearchPage {
  results: RecipeSummary[];
  offset: number;
  number: number;
  totalResults: number;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * complexSearch with addRecipeInformation + addRecipeNutrition so the proxy
 * returns enough per-result data to populate a card without a second call.
 *
 * Point cost: ~0.025 per result + base. With our edge cache, repeated queries
 * are free after the first request — see api/spoonacular.ts.
 */
export async function searchRecipes(
  params: SearchParams,
  options: CallOptions = {},
): Promise<SearchPage> {
  const query: Record<string, string | number | boolean | string[] | undefined> = {
    addRecipeInformation: true,
    addRecipeNutrition: true,
    instructionsRequired: true, // we want to be able to show steps later
    number: params.number ?? DEFAULT_PAGE_SIZE,
    offset: params.offset ?? 0,
    sort: params.sort ?? 'popularity',
  };

  if (params.query) query.query = params.query;
  if (params.diet) query.diet = params.diet;
  if (params.intolerances && params.intolerances.length > 0) {
    query.intolerances = params.intolerances.join(',');
  }
  if (params.type) query.type = params.type;
  if (params.maxReadyTime) query.maxReadyTime = params.maxReadyTime;
  if (params.minCalories != null) query.minCalories = params.minCalories;
  if (params.maxCalories != null) query.maxCalories = params.maxCalories;

  const data = await callSpoonacular<SpoonacularSearchResponse>(
    'recipes/complexSearch',
    query,
    options,
  );

  // Drop any hit that has no usable instructions. Spoonacular's
  // instructionsRequired flag isn't strict enough — see hasCookableSteps.
  const usable = (data.results ?? []).filter(hasCookableSteps);

  return {
    results: usable.map((r: SpoonacularSearchHit) => toRecipeSummary(r)),
    offset: data.offset ?? 0,
    number: data.number ?? DEFAULT_PAGE_SIZE,
    totalResults: data.totalResults ?? 0,
  };
}

/** Cheap (0.1 pt) type-ahead. Returns at most `number` titles. */
export async function autocompleteRecipes(
  query: string,
  number = 8,
  options: CallOptions = {},
): Promise<SpoonacularAutocompleteHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return callSpoonacular<SpoonacularAutocompleteHit[]>(
    'recipes/autocomplete',
    { query: trimmed, number },
    options,
  );
}
