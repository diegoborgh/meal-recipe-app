/*
 * Display formatting helpers. Pure functions — no React, no Dexie.
 *
 * Two responsibilities:
 *   1. Translate Spoonacular API hits → app-internal Recipe* shapes
 *   2. Format primitives (minutes → "25 min", calories → "420 kcal", etc.)
 *
 * The badge mapping intentionally lives here, not in components: every Recipe
 * card and detail page should derive the same badges from the same flags.
 */

import type {
  SpoonacularExtendedIngredient,
  SpoonacularNutrient,
  SpoonacularRecipeInfo,
  SpoonacularSearchHit,
} from '@/types/api';
import type {
  Recipe,
  RecipeBadge,
  RecipeIngredient,
  RecipeSummary,
} from '@/types/recipe';

/** Pretty time string. Falls back to null when minutes are missing. */
export function formatReadyTime(minutes: number | undefined): string | null {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

/** "420 kcal" or null. */
export function formatCalories(kcal: number | null | undefined): string | null {
  if (kcal == null || !Number.isFinite(kcal) || kcal < 0) return null;
  return `${Math.round(kcal)} kcal`;
}

/** Pull a named nutrient amount out of Spoonacular's nutrients[] array. */
export function findNutrient(
  nutrients: SpoonacularNutrient[] | undefined,
  name: string,
): number | null {
  if (!nutrients) return null;
  const hit = nutrients.find((n) => n.name.toLowerCase() === name.toLowerCase());
  return hit?.amount ?? null;
}

/**
 * Derive diet badges from Spoonacular's boolean flags + diets[] array.
 *
 * Locked decision: health score is never surfaced. Diet badges + nutrition stats
 * carry the health framing. We pick at most 2 badges for cards, prioritizing
 * the most informative.
 */
export function badgesFor(hit: SpoonacularSearchHit): RecipeBadge[] {
  const badges: RecipeBadge[] = [];

  // Order matters: vegan > vegetarian > pescatarian (most restrictive first).
  if (hit.vegan) badges.push({ label: 'Vegan', tone: 'olive' });
  else if (hit.vegetarian) badges.push({ label: 'Vegetarian', tone: 'olive' });
  else if (hit.diets?.some((d) => /pesc/i.test(d))) {
    badges.push({ label: 'Pescatarian', tone: 'rose' });
  }

  if (hit.glutenFree) badges.push({ label: 'GF', tone: badges.length === 0 ? 'olive' : 'cream' });
  if (hit.dairyFree && badges.length < 2) {
    badges.push({ label: 'Dairy-free', tone: 'cream' });
  }
  if (hit.ketogenic && badges.length < 2) badges.push({ label: 'Keto', tone: 'honey' });

  // Quick signal — useful when nothing else applies.
  if (badges.length === 0 && hit.readyInMinutes != null && hit.readyInMinutes <= 20) {
    badges.push({ label: 'Quick', tone: 'honey' });
  }

  return badges.slice(0, 2);
}

/** Map a Spoonacular complexSearch hit into a card-ready RecipeSummary. */
export function toRecipeSummary(hit: SpoonacularSearchHit): RecipeSummary {
  const kcal = findNutrient(hit.nutrition?.nutrients, 'Calories');
  return {
    id: hit.id,
    title: hit.title,
    time: formatReadyTime(hit.readyInMinutes),
    calories: formatCalories(kcal),
    image: hit.image,
    badges: badgesFor(hit),
  };
}

/** Convert a Spoonacular extendedIngredient into an app-internal RecipeIngredient. */
function toIngredient(raw: SpoonacularExtendedIngredient): RecipeIngredient {
  return {
    id: raw.id,
    name: raw.name,
    original: raw.original,
    amount: {
      us: {
        value: raw.measures?.us?.amount ?? raw.amount,
        unit: raw.measures?.us?.unitShort ?? raw.unit,
      },
      metric: {
        value: raw.measures?.metric?.amount ?? raw.amount,
        unit: raw.measures?.metric?.unitShort ?? raw.unit,
      },
    },
  };
}

/**
 * Pull the structured step list out of analyzedInstructions, falling back to
 * a naïve split of the HTML `instructions` field if it's empty.
 *
 * We strip HTML tags from the fallback rather than render dangerouslySetInnerHTML —
 * Spoonacular content is third-party and "calm, not alarming" includes XSS-safe.
 */
function extractSteps(info: SpoonacularRecipeInfo): string[] {
  const sets = info.analyzedInstructions ?? [];
  const fromAnalyzed = sets.flatMap((s) => s.steps.map((step) => step.step.trim()));
  if (fromAnalyzed.length > 0) return fromAnalyzed.filter(Boolean);

  if (info.instructions) {
    const text = info.instructions.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Split on sentence boundaries — coarse but good enough for the fallback.
    return text
      .split(/(?<=\.)\s+(?=[A-Z])/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** Map a /recipes/{id}/information response into a full Recipe. */
export function toRecipe(info: SpoonacularRecipeInfo): Recipe {
  const summary = toRecipeSummary(info as unknown as SpoonacularSearchHit);
  const nutrients = info.nutrition?.nutrients;
  return {
    ...summary,
    servings: info.servings,
    sourceName: info.sourceName,
    sourceUrl: info.sourceUrl,
    ingredients: (info.extendedIngredients ?? []).map(toIngredient),
    steps: extractSteps(info),
    nutrition: {
      calories: findNutrient(nutrients, 'Calories'),
      protein: findNutrient(nutrients, 'Protein'),
      carbs: findNutrient(nutrients, 'Carbohydrates'),
      fat: findNutrient(nutrients, 'Fat'),
    },
  };
}

/* ── Servings + amount formatting ──────────────────────────────────────── */

/**
 * Pretty amount string. Renders fractions for common values (½, ¼, ⅓, ⅔, ¾)
 * and decimals otherwise. Trims trailing zeros.
 */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  // Fractions are kinder than 0.5 / 0.333 in a recipe context.
  const fractions: Record<string, string> = {
    '0.25': '¼',
    '0.33': '⅓',
    '0.333': '⅓',
    '0.5': '½',
    '0.66': '⅔',
    '0.666': '⅔',
    '0.667': '⅔',
    '0.75': '¾',
  };
  const whole = Math.floor(value);
  const remainder = value - whole;
  const remKey = remainder.toFixed(remainder < 0.4 ? 3 : 2);
  const frac = fractions[remKey];
  if (frac) return whole > 0 ? `${whole} ${frac}` : frac;
  // Otherwise: trim to 2 decimals, drop trailing zeros.
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/**
 * Scale an amount by the new servings ratio. Returns the same unit (Spoonacular
 * units don't change with quantity in the API — ml stays ml, tbsp stays tbsp).
 */
export function scaleAmount(value: number, originalServings: number, newServings: number): number {
  if (originalServings <= 0) return value;
  return (value * newServings) / originalServings;
}
