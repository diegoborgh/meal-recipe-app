/*
 * Favorite-table helpers. Higher-level than raw Dexie reads/writes — encodes
 * the "save the summary now, upgrade with full data later" pattern that the
 * UI relies on for instant heart-tap feedback.
 *
 * Components should NOT call db.favorites directly; go through these helpers
 * so the upgrade path stays in one place.
 */

import { getRecipe } from '@/api/recipe';
import type { Recipe, RecipeSummary } from '@/types/recipe';
import { db, type FavoriteRow } from './index';

/**
 * Fill in a Recipe shape from a RecipeSummary. The missing detail fields get
 * empty defaults so the row matches the Recipe type and the favorites list
 * (which only reads summary fields) still works correctly.
 */
function summaryToRecipe(s: RecipeSummary): Recipe {
  return {
    ...s,
    servings: 1,
    sourceName: undefined,
    sourceUrl: undefined,
    ingredients: [],
    steps: [],
    nutrition: { calories: null, protein: null, carbs: null, fat: null },
  };
}

/**
 * Save a recipe optimistically with summary data, then upgrade to full data
 * in the background. Resolves immediately after the optimistic insert.
 *
 * Caller should not await the upgrade — the UI can react to the live row
 * change via useLiveQuery once `complete: true` lands.
 */
export async function saveFavorite(summary: RecipeSummary): Promise<void> {
  const now = Date.now();
  // Optimistic: insert with whatever we have right now, mark incomplete.
  // `put` is upsert, so this also handles re-adds after a transient remove.
  const optimistic: FavoriteRow = {
    ...summaryToRecipe(summary),
    savedAt: now,
    complete: false,
  };
  await db.favorites.put(optimistic);

  // Upgrade in the background. Errors are non-fatal — the favorite still works
  // for offline list display; the detail page will fall back to API.
  void upgradeFavorite(summary.id).catch(() => {
    /* swallow — incomplete row stays usable */
  });
}

/**
 * Fetch the full recipe and merge it into the existing favorite row.
 * Idempotent — safe to retry. Refuses to upgrade a row that's been removed
 * since the optimistic save (e.g. user un-hearted before the fetch returned).
 */
export async function upgradeFavorite(id: number): Promise<void> {
  const existing = await db.favorites.get(id);
  if (!existing) return; // removed mid-flight; bail
  if (existing.complete) return; // already upgraded

  const full = await getRecipe(id);
  // Re-check existence after the await — the user may have un-hearted while
  // we were fetching. Don't resurrect a deleted favorite.
  const stillThere = await db.favorites.get(id);
  if (!stillThere) return;

  const upgraded: FavoriteRow = {
    ...full,
    savedAt: stillThere.savedAt,
    complete: true,
  };
  await db.favorites.put(upgraded);
}

/** Re-add a previously-removed favorite (for the undo toast). */
export async function restoreFavorite(row: FavoriteRow): Promise<void> {
  await db.favorites.put(row);
  // If the restored row was incomplete, kick the upgrade again.
  if (!row.complete) {
    void upgradeFavorite(row.id).catch(() => {});
  }
}

/**
 * Remove a favorite. Returns the removed row so the caller can offer Undo.
 * Returns null when the row didn't exist (no-op).
 */
export async function removeFavorite(id: number): Promise<FavoriteRow | null> {
  const row = await db.favorites.get(id);
  if (!row) return null;
  await db.favorites.delete(id);
  return row;
}

/** Fast existence check; the FavoritesContext uses this to drive heart icons. */
export async function isFavorite(id: number): Promise<boolean> {
  const count = await db.favorites.where('id').equals(id).count();
  return count > 0;
}
