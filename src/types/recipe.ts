/*
 * App-internal Recipe types.
 *
 * Spoonacular's payloads are mapped into these via src/lib/format.ts. Components
 * and Dexie tables consume RecipeSummary / Recipe — never the raw API shapes.
 * This isolation lets us swap the upstream provider later if needed and gives
 * us one place to translate field names + add computed fields (e.g. calories
 * extracted from the nutrients[] array).
 */

import type { DietBadgeTone } from '@/components/DietBadge';

/** Pre-formatted badge data for the RecipeCard. */
export interface RecipeBadge {
  label: string;
  tone: DietBadgeTone;
}

/**
 * Lightweight recipe data — what shows on a card. Always derivable from a
 * complexSearch result with `addRecipeInformation=true&addRecipeNutrition=true`.
 */
export interface RecipeSummary {
  id: number;
  title: string;
  /** Pre-formatted, e.g. "25 min". `null` when readyInMinutes was missing. */
  time: string | null;
  /** Pre-formatted, e.g. "420 kcal". `null` when nutrition was missing. */
  calories: string | null;
  /** Spoonacular CDN URL or undefined; cards handle the fallback. */
  image: string | undefined;
  badges: RecipeBadge[];
}

/**
 * Full recipe — used by the Recipe Detail / Cook Mode (slice 3+).
 * For slice 2 we only need RecipeSummary; this is here so Dexie / favorites
 * can declare the full type without churning later.
 */
export interface Recipe extends RecipeSummary {
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  /** Nutrition macros for the per-serving display. */
  nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
  sourceUrl: string | undefined;
  sourceName: string | undefined;
}

export interface RecipeIngredient {
  id: number;
  name: string;
  /** Original text from Spoonacular ("2 tbsp olive oil"). Used as fallback. */
  original: string;
  amount: { us: { value: number; unit: string }; metric: { value: number; unit: string } };
}
