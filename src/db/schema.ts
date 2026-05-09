/*
 * Skillet's Dexie (IndexedDB) schema.
 *
 * Versioning rule: never edit a past version. To change shape, append a new
 * `db.version(N).stores(...).upgrade(...)` block. Dexie runs upgrades in order
 * across browsers, so renaming a property in v1 after v1 has shipped will
 * silently break existing users.
 *
 * Rows-by-table (current):
 *   favorites    — saved recipes, full payload cached for offline detail view.
 *   preferences  — single-row settings (slice 6 — declared now to lock the schema).
 *   fridge       — user's pantry ingredients (slice 7).
 *
 * Indexed fields go in `stores()`; everything else is just stored on the row.
 */

import Dexie, { type Table } from 'dexie';
import type { Recipe } from '@/types/recipe';

/**
 * A favorite is the full Recipe + a savedAt timestamp + a `complete` flag that
 * tells consumers whether the row carries a full payload (post-upgrade fetch)
 * or only the RecipeSummary data we had at save time.
 *
 * `complete: false` rows are still useful for the favorites list (which only
 * needs summary fields) but the detail page should fall through to the API
 * if the user opens one before the upgrade lands.
 */
export interface FavoriteRow extends Recipe {
  savedAt: number;
  complete: boolean;
}

export interface PreferencesRow {
  /** Always 'singleton' — there's only ever one row in this table. */
  id: 'singleton';
  /** Single diet (Spoonacular API only accepts one). null = no preference. */
  diet: string | null;
  /** Intolerances to ALWAYS apply on search — never overridden in filters. */
  intolerances: string[];
  /** Optional kcal target; doesn't auto-filter, just a tracker for v2 features. */
  calorieTarget: number | null;
  units: 'us' | 'metric';
  updatedAt: number;
}

export interface FridgeIngredientRow {
  /** Lowercase canonical name; doubles as primary key. */
  name: string;
  /** Spoonacular id when known; null when free-typed by the user. */
  spoonacularId: number | null;
  addedAt: number;
}

export class SkilletDB extends Dexie {
  favorites!: Table<FavoriteRow, number>;
  preferences!: Table<PreferencesRow, 'singleton'>;
  fridge!: Table<FridgeIngredientRow, string>;

  constructor() {
    super('skillet');

    this.version(1).stores({
      // `id` is the primary key (Spoonacular recipe id). `savedAt` is indexed
      // for "newest first" sort.
      favorites: '&id, savedAt',
      // Single-row table — primary key is a literal 'singleton' string.
      preferences: '&id',
      // Free-text primary key (the ingredient name); spoonacularId is indexed
      // for lookups when we need to round-trip to the API.
      fridge: '&name, spoonacularId',
    });

    // v2: add `addedAt` index on fridge so we can `orderBy('addedAt')` for
    // the "newest first" ordering used in FridgeContext + db/fridge helpers.
    // Existing v1 data is preserved — Dexie auto-builds the index on upgrade.
    this.version(2).stores({
      favorites: '&id, savedAt',
      preferences: '&id',
      fridge: '&name, spoonacularId, addedAt',
    });
  }
}
