/**
 * Single Dexie instance for the whole app. Importing this module opens the
 * IndexedDB connection lazily on first access; modules never construct their
 * own database — always import `db` from here.
 */
import { SkilletDB } from './schema';

export const db = new SkilletDB();

export type { FavoriteRow, PreferencesRow, FridgeIngredientRow } from './schema';
