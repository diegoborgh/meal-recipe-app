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
} from '@/types/api';

export interface FridgeMatchResult {
  id: number;
  title: string;
  image: string | undefined;
  /** Count of ingredients you have that this recipe uses. */
  usedCount: number;
  /** Count of ingredients you'd need to buy. */
  missedCount: number;
  /** Names of missing ingredients (lowercased). Used for the "need: parsley, lemon" line. */
  missedNames: string[];
  /** Names of matched ingredients. */
  usedNames: string[];
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
