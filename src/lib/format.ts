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
  SpoonacularNutrient,
  SpoonacularSearchHit,
} from '@/types/api';
import type { RecipeBadge, RecipeSummary } from '@/types/recipe';

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
