/**
 * Recipe-detail API wrapper. Calls the Vercel proxy → /recipes/{id}/information
 * with `includeNutrition=true` so the macros land in a single request.
 *
 * Edge cache: 24h via the proxy (recipes rarely change). When a user favorites
 * a recipe (slice 5), the full payload is cached in Dexie so re-opening costs
 * zero Spoonacular points and works offline.
 */

import { callSpoonacular, type CallOptions } from './client';
import type { SpoonacularRecipeInfo } from '@/types/api';
import type { Recipe } from '@/types/recipe';
import { toRecipe } from '@/lib/format';

export async function getRecipe(
  id: number,
  options: CallOptions = {},
): Promise<Recipe> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid recipe id: ${id}`);
  }
  const data = await callSpoonacular<SpoonacularRecipeInfo>(
    'recipes/information',
    { id, includeNutrition: true },
    options,
  );
  return toRecipe(data);
}
