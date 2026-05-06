/**
 * Client-side wrapper around /api/spoonacular.
 *
 * Feature code calls these helpers — never `fetch` directly. Centralizes:
 *   - URL building with the `endpoint` discriminator the proxy expects
 *   - AbortController plumbing so callers can cancel in flight
 *   - Quota error mapping (402/429 → typed `QuotaError`)
 *   - JSON parsing
 *
 * The function is the single source of truth for what endpoints exist and
 * what they cache; this file is just a typed front door.
 */

export class QuotaError extends Error {
  constructor(public status: 402 | 429, message: string) {
    super(message);
    this.name = 'QuotaError';
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

export type SpoonacularEndpoint =
  | 'recipes/complexSearch'
  | 'recipes/autocomplete'
  | 'recipes/findByIngredients'
  | 'recipes/information'
  | 'food/ingredients/autocomplete';

export type QueryParams = Record<string, string | number | boolean | string[] | undefined>;

export interface CallOptions {
  signal?: AbortSignal;
}

export async function callSpoonacular<T>(
  endpoint: SpoonacularEndpoint,
  params: QueryParams = {},
  options: CallOptions = {},
): Promise<T> {
  const url = new URL('/api/spoonacular', window.location.origin);
  url.searchParams.set('endpoint', endpoint);

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      v.forEach((x) => url.searchParams.append(k, String(x)));
    } else {
      url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    ...(options.signal ? { signal: options.signal } : {}),
  });

  if (res.status === 402 || res.status === 429) {
    throw new QuotaError(
      res.status,
      res.status === 402 ? 'Daily quota exhausted.' : 'Rate limited.',
    );
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, `API error ${res.status}`, body);
  }

  return (await res.json()) as T;
}
