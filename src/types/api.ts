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

/** Per-ingredient amount in a single unit system. */
export interface SpoonacularMeasure {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface SpoonacularExtendedIngredient {
  id: number;
  /** Lowercase canonical name. */
  name: string;
  /** Full text as it appeared in the source ("4 salmon fillets, skin-on"). */
  original: string;
  /** Defaults to US — when unit-toggle is off. */
  amount: number;
  unit: string;
  measures: {
    us: SpoonacularMeasure;
    metric: SpoonacularMeasure;
  };
  image?: string;
  aisle?: string;
}

export interface SpoonacularStep {
  number: number;
  step: string;
  ingredients?: { id: number; name: string; image?: string }[];
  equipment?: { id: number; name: string; image?: string }[];
  length?: { number: number; unit: string };
}

export interface SpoonacularInstructionSet {
  /** Section name — most recipes have a single unnamed set. */
  name: string;
  steps: SpoonacularStep[];
}

/**
 * /recipes/{id}/information response. Spoonacular returns ~50 fields;
 * we narrow to what Skillet renders.
 */
export interface SpoonacularRecipeInfo {
  id: number;
  title: string;
  image?: string;
  imageType?: string;
  servings: number;
  readyInMinutes?: number;
  cookingMinutes?: number;
  preparationMinutes?: number;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryHealthy?: boolean;
  ketogenic?: boolean;
  whole30?: boolean;
  /** Locked decision: never surfaced. */
  healthScore?: number;
  diets?: string[];
  dishTypes?: string[];
  cuisines?: string[];
  sourceName?: string;
  sourceUrl?: string;
  creditsText?: string;
  /** HTML summary; we don't render raw HTML, but useful for SEO/preview. */
  summary?: string;
  extendedIngredients: SpoonacularExtendedIngredient[];
  analyzedInstructions: SpoonacularInstructionSet[];
  /** Plain HTML fallback when analyzedInstructions is empty. */
  instructions?: string;
  nutrition?: SpoonacularNutrition;
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
