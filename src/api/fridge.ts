/*
 * Fridge-related API wrappers. Two endpoints:
 *
 *   /recipes/findByIngredients   — given a list of ingredients on hand, return
 *                                  recipes ranked by how many they use.
 *   /food/ingredients/autocomplete — type-ahead for the chip input.
 *
 * Note on cost: findByIngredients charges ~1 point per result. We cap at 20
 * which is a good budget/utility trade for the free tier. Users can re-fire
 * by adding/removing chips; the session cache absorbs duplicates.
 */

import { callSpoonacular, type CallOptions } from './client';
import type {
  SpoonacularFindByIngredientsHit,
  SpoonacularIngredientAutocompleteHit,
  SpoonacularRecipeInfo,
  SpoonacularSearchHit,
} from '@/types/api';
import {
  badgesFor,
  findNutrient,
  formatCalories,
  formatReadyTime,
  hasCookableSteps,
} from '@/lib/format';
import type { RecipeBadge } from '@/types/recipe';

export interface FridgeMatchResult {
  id: number;
  title: string;
  image: string | undefined;
  /** Count of ingredients you have that this recipe uses. */
  usedCount: number;
  /** Count of ingredients you'd need to buy. */
  missedCount: number;
  /** Names of missing ingredients (lowercased). Retained for accessibility / debugging. */
  missedNames: string[];
  /** Names of matched ingredients. */
  usedNames: string[];
  /** Pretty time string, e.g. "25 min". Populated by enrichFridgeMatches. */
  time?: string | null;
  /** Pretty calorie string, e.g. "420 kcal". Populated by enrichFridgeMatches. */
  calories?: string | null;
  /** Diet badges (GF / Dairy-free / Vegan …). Populated by enrichFridgeMatches. */
  badges?: RecipeBadge[];
}

/**
 * Find recipes by ingredients on hand.
 *
 * `ranking=1` maximizes used ingredients (most matches first). `ignorePantry=true`
 * tells Spoonacular to exclude staples like salt/oil from the missing list —
 * otherwise every recipe shows "missing salt" which isn't useful.
 */
export async function findRecipesByIngredients(
  ingredients: string[],
  number = 20,
  options: CallOptions = {},
): Promise<FridgeMatchResult[]> {
  if (ingredients.length === 0) return [];
  const data = await callSpoonacular<SpoonacularFindByIngredientsHit[]>(
    'recipes/findByIngredients',
    {
      ingredients: ingredients.join(','),
      number,
      ranking: 1,
      ignorePantry: true,
    },
    options,
  );
  return data.map((hit) => ({
    id: hit.id,
    title: hit.title,
    image: hit.image,
    usedCount: hit.usedIngredientCount,
    missedCount: hit.missedIngredientCount,
    usedNames: (hit.usedIngredients ?? []).map((i) => i.name.toLowerCase()),
    missedNames: (hit.missedIngredients ?? []).map((i) => i.name.toLowerCase()),
  }));
}

/**
 * Enrich findByIngredients matches with time, calories, and diet badges so
 * cards can mirror the design (`25 min · 420 kcal` + GF/Dairy-free chips).
 * findByIngredients itself doesn't include any of those fields, so we follow
 * up with informationBulk.
 *
 * Also drops recipes that have no cookable steps — parity with search, which
 * filters via `hasCookableSteps` in the complexSearch path. Without this,
 * Fridge results occasionally surface recipes that open to a dead-end detail
 * page. We only drop when we actually got info back; if a match is missing
 * from the bulk response, keep it (better to show an unenriched card than to
 * silently hide a result).
 *
 * Cost: ~1 pt per id. Acceptable because findByIngredients caps at 20 results
 * and the 24h edge cache absorbs repeat queries.
 */
export async function enrichFridgeMatches(
  matches: FridgeMatchResult[],
  options: CallOptions = {},
): Promise<FridgeMatchResult[]> {
  if (matches.length === 0) return matches;
  const ids = matches.map((m) => m.id).join(',');
  const data = await callSpoonacular<SpoonacularRecipeInfo[]>(
    'recipes/informationBulk',
    { ids, includeNutrition: true },
    options,
  );
  const byId = new Map<number, SpoonacularRecipeInfo>();
  for (const info of data) byId.set(info.id, info);

  const enriched: FridgeMatchResult[] = [];
  for (const m of matches) {
    const info = byId.get(m.id);
    if (!info) {
      enriched.push(m);
      continue;
    }
    // badgesFor + hasCookableSteps both expect a SpoonacularSearchHit shape;
    // the fields they read (boolean flags, diets[], readyInMinutes,
    // analyzedInstructions, instructions) all exist on SpoonacularRecipeInfo
    // too. Cast rather than duplicate the helpers.
    const hitShaped = info as unknown as SpoonacularSearchHit;
    if (!hasCookableSteps(hitShaped)) continue;
    const kcal = findNutrient(info.nutrition?.nutrients, 'Calories');
    enriched.push({
      ...m,
      time: formatReadyTime(info.readyInMinutes),
      calories: formatCalories(kcal),
      badges: badgesFor(hitShaped),
    });
  }
  return enriched;
}

/** Cheap (0.1 pt) ingredient name autocomplete for the chip input. */
export async function autocompleteIngredient(
  query: string,
  number = 8,
  options: CallOptions = {},
): Promise<SpoonacularIngredientAutocompleteHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  return callSpoonacular<SpoonacularIngredientAutocompleteHit[]>(
    'food/ingredients/autocomplete',
    { query: trimmed, number },
    options,
  );
}
