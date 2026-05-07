/*
 * Spoonacular response types.
 *
 * Narrowed to the fields we actually use. Spoonacular's payloads are huge and
 * mostly noise — narrowing keeps autocomplete tight and makes upstream changes
 * cheap to absorb (we only break if a field we use changes).
 *
 * Endpoint reference: https://spoonacular.com/food-api/docs
 */

/** Single nutrient from the nutrition.nutrients[] array. */
export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface SpoonacularNutrition {
  nutrients?: SpoonacularNutrient[];
}

/**
 * complexSearch result with addRecipeInformation=true & addRecipeNutrition=true.
 * Without the flags, only id/title/image are guaranteed.
 */
export interface SpoonacularSearchHit {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  readyInMinutes?: number;
  servings?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  cheap?: boolean;
  veryPopular?: boolean;
  sustainable?: boolean;
  lowFodmap?: boolean;
  ketogenic?: boolean;
  whole30?: boolean;
  /** Spoonacular's 0–100 health score. Per locked decision: NEVER surface in UI. */
  healthScore?: number;
  diets?: string[];
  dishTypes?: string[];
  nutrition?: SpoonacularNutrition;
  sourceUrl?: string;
  sourceName?: string;
  summary?: string;
}

export interface SpoonacularSearchResponse {
  results: SpoonacularSearchHit[];
  offset: number;
  number: number;
  totalResults: number;
}

/** /recipes/autocomplete returns an array of these. */
export interface SpoonacularAutocompleteHit {
  id: number;
  title: string;
  imageType?: string;
}

/** /food/ingredients/autocomplete (used by the Fridge feature). */
export interface SpoonacularIngredientAutocompleteHit {
  name: string;
  image?: string;
}

/** /recipes/findByIngredients returns these (Fridge feature). */
export interface SpoonacularFindByIngredientsHit {
  id: number;
  title: string;
  image?: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: { id: number; name: string; original: string }[];
  missedIngredients: { id: number; name: string; original: string }[];
}
