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
 * Full recipe — used by Recipe Detail / Cook Mode and persisted in Dexie when
 * a user favorites. Servings + amounts are stored as the *original* recipe
 * scale; the UI computes scaled amounts at render time.
 */
export interface Recipe extends RecipeSummary {
  /** Original servings count from the source. UI may scale up/down from here. */
  servings: number;
  /** Free-form attribution for the byline. */
  sourceName: string | undefined;
  sourceUrl: string | undefined;
  ingredients: RecipeIngredient[];
  steps: string[];
  /** Nutrition macros, per ORIGINAL serving. UI scales as needed. */
  nutrition: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}

export interface RecipeAmount {
  /** Numeric amount; can be fractional (e.g. 0.5). */
  value: number;
  /** Display unit (Spoonacular's `unitShort` — "cup", "tbsp", "g", ""). */
  unit: string;
}

export interface RecipeIngredient {
  id: number;
  /** Lowercase canonical name ("salmon fillets"). */
  name: string;
  /** Full source text. Used as fallback when measures are missing. */
  original: string;
  /** Pre-extracted unit-aware amounts; we don't convert ourselves. */
  amount: {
    us: RecipeAmount;
    metric: RecipeAmount;
  };
}
