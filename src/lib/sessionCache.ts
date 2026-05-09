/*
 * Session-scoped in-memory cache.
 *
 * Lifetime: lives for as long as this JS module is loaded — which is to say,
 * until the tab is closed or the page is hard-reloaded. Soft navigation
 * within the SPA does NOT clear it.
 *
 * Why we have it:
 *   - Spoonacular's free tier is 150 points/day. A user clicking Cook → Home
 *     three times during a cooking session shouldn't burn three searches.
 *   - In production Vercel's edge cache absorbs identical URLs for an hour,
 *     but `vercel dev` doesn't run that cache locally — every navigation hits
 *     Spoonacular fresh. This evens the floor across environments.
 *   - It also makes the Home "Tonight's picks" feel intentional: the user
 *     gets the same picks for the session instead of a different set every
 *     time they navigate back.
 *
 * What this is NOT:
 *   - Not Dexie. The favorites cache is separate and persists across sessions
 *     for offline support; this one is RAM-only.
 *   - Not a full SWR/React Query. No revalidation, no inflight dedupe. Hooks
 *     that need those layer them on top.
 *   - No TTL. Full-reload to refresh. Matches a user's mental model of
 *     "while the tab is open."
 */

const cache = new Map<string, unknown>();

/** Hash params into a stable string key. Stable across object key order. */
export function cacheKey(namespace: string, params: unknown): string {
  // JSON.stringify isn't order-stable across object literals in general, but
  // our params are flat objects built consistently — fine for this scope.
  return `${namespace}::${JSON.stringify(params, sortReplacer)}`;
}

function sortReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
    return sorted;
  }
  return value;
}

export function getCached<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

/**
 * Drop a single entry — useful when an upstream mutation invalidates a query
 * (e.g. user explicitly hits a refresh button). Not used currently.
 */
export function evict(key: string): void {
  cache.delete(key);
}

/** Wipe everything. Currently unused; here for future "Clear data" flows. */
export function clearSessionCache(): void {
  cache.clear();
}
