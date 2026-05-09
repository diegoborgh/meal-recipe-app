/*
 * Fridge table helpers. The user's pantry — what they have on hand to cook
 * with. Persisted in Dexie so the list survives reloads.
 *
 * Schema lives in src/db/schema.ts as `fridge`. The primary key is the
 * lowercase ingredient name; that doubles as natural dedup (re-adding
 * "Eggs" and "eggs" yields one row).
 */

import { db, type FridgeIngredientRow } from './index';

/** Normalize for storage and comparison. */
export function normalizeIngredient(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function addIngredient(
  rawName: string,
  spoonacularId: number | null = null,
): Promise<void> {
  const name = normalizeIngredient(rawName);
  if (!name) return;
  const existing = await db.fridge.get(name);
  if (existing) return; // already there — no-op
  await db.fridge.put({
    name,
    spoonacularId,
    addedAt: Date.now(),
  });
}

export async function removeIngredient(rawName: string): Promise<void> {
  const name = normalizeIngredient(rawName);
  await db.fridge.delete(name);
}

export async function clearFridge(): Promise<void> {
  await db.fridge.clear();
}

export async function listIngredients(): Promise<FridgeIngredientRow[]> {
  return db.fridge.orderBy('addedAt').toArray();
}
