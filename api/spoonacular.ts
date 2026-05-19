/*
 * Vercel Serverless Function — Spoonacular proxy.
 *
 * The browser never talks to Spoonacular directly. This function:
 *   1. Accepts a request from the client specifying which Spoonacular
 *      endpoint to call and which params to forward.
 *   2. Attaches the API key from process.env.SPOONACULAR_API_KEY (server-side,
 *      no VITE_ prefix — never goes near the client bundle).
 *   3. Sets Cache-Control headers tuned per endpoint so Vercel's edge cache
 *      absorbs repeat queries and the daily 150-point Spoonacular budget lasts.
 *   4. Passes through 402/429 quota errors so the client can show the
 *      "calm, not alarming" error state.
 *
 * Why a proxy at all: see docs/build-prompt.md → "API & Vercel architecture".
 * VITE_-prefixed env vars are baked into the client bundle at build time and
 * are visible in DevTools. For a public portfolio piece that would burn the
 * 150-point quota in seconds.
 *
 * Allowlist, don't blanket-forward: only known-good Spoonacular endpoints are
 * proxied. Unknown paths get a 400 — keeps the proxy from being a free relay.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPOONACULAR_BASE = 'https://api.spoonacular.com';

/**
 * Allowlist of endpoints we forward, with their per-endpoint edge cache policy.
 * `swr` = stale-while-revalidate window (seconds).
 */
const ENDPOINTS = {
  // Recipe search by query + filters. Vary by full query string. ~1hr edge cache.
  'recipes/complexSearch': {
    path: '/recipes/complexSearch',
    sMaxAge: 60 * 60,           // 1 hour
    swr: 60 * 60 * 6,           // 6 hours
  },
  // Type-ahead autocomplete. Cheap (0.1 pts) but very chatty — cache hard.
  'recipes/autocomplete': {
    path: '/recipes/autocomplete',
    sMaxAge: 60 * 60 * 6,       // 6 hours
    swr: 60 * 60 * 24,
  },
  // Find recipes by ingredients on hand (Fridge feature).
  'recipes/findByIngredients': {
    path: '/recipes/findByIngredients',
    sMaxAge: 60 * 60,
    swr: 60 * 60 * 6,
  },
  // Full recipe info. Recipes rarely change; cache 24hr.
  'recipes/information': {
    // Special: needs an :id segment substituted from query param `id`.
    path: '/recipes/{id}/information',
    sMaxAge: 60 * 60 * 24,      // 24 hours
    swr: 60 * 60 * 24 * 7,
  },
  // Bulk recipe info — used by the Fridge feature to enrich findByIngredients
  // results with time/calories. Same cacheability as /information.
  'recipes/informationBulk': {
    path: '/recipes/informationBulk',
    sMaxAge: 60 * 60 * 24,
    swr: 60 * 60 * 24 * 7,
  },
  // Ingredient autocomplete (Fridge input).
  'food/ingredients/autocomplete': {
    path: '/food/ingredients/autocomplete',
    sMaxAge: 60 * 60 * 6,
    swr: 60 * 60 * 24,
  },
} as const;

type EndpointKey = keyof typeof ENDPOINTS;

function isEndpointKey(value: unknown): value is EndpointKey {
  return typeof value === 'string' && value in ENDPOINTS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only GET — Spoonacular endpoints we use are all idempotent reads.
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'SPOONACULAR_API_KEY is not configured on the server.' });
  }

  const { endpoint, ...rest } = req.query;
  if (!isEndpointKey(endpoint)) {
    return res.status(400).json({
      error: 'Unknown or missing endpoint.',
      allowed: Object.keys(ENDPOINTS),
    });
  }

  const cfg = ENDPOINTS[endpoint];

  // Build the forwarding URL. Substitute {id} for /recipes/{id}/information.
  let path: string = cfg.path;
  if (path.includes('{id}')) {
    const id = typeof rest.id === 'string' ? rest.id : Array.isArray(rest.id) ? rest.id[0] : '';
    if (!id || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'Missing or invalid recipe id.' });
    }
    path = path.replace('{id}', id);
    delete rest.id;
  }

  const url = new URL(SPOONACULAR_BASE + path);
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined) continue;
    if (Array.isArray(v)) {
      v.forEach((x) => url.searchParams.append(k, String(x)));
    } else {
      url.searchParams.set(k, String(v));
    }
  }
  url.searchParams.set('apiKey', apiKey);

  try {
    const upstream = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    // Pass through 402 (quota exhausted) and 429 (rate limited) so the client
    // can render the calm error state and serve cached/favorited content.
    if (upstream.status === 402 || upstream.status === 429) {
      res.setHeader('Cache-Control', 'no-store');
      const body = await safeJson(upstream);
      return res.status(upstream.status).json({
        error: upstream.status === 402 ? 'Daily quota exhausted.' : 'Rate limited.',
        upstream: body,
      });
    }

    if (!upstream.ok) {
      const body = await safeJson(upstream);
      return res.status(upstream.status).json({ error: 'Upstream error', upstream: body });
    }

    // Edge cache: shared cache via s-maxage + stale-while-revalidate.
    res.setHeader(
      'Cache-Control',
      `public, s-maxage=${cfg.sMaxAge}, stale-while-revalidate=${cfg.swr}`,
    );

    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      error: 'Failed to reach Spoonacular.',
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

async function safeJson(r: Response): Promise<unknown> {
  try {
    return await r.json();
  } catch {
    return null;
  }
}
