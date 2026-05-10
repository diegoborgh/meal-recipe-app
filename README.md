# Skillet

A local-first Meal Recipe Progressive Web App. *Come into the kitchen.*

> Install Skillet on your phone, search for a recipe, save the ones you want
> to come back to, then open the app at the kitchen counter — no Wi-Fi
> required for what you've already saved.

## Features

| | |
|---|---|
| 🔎 **Search** | Type-ahead autocomplete, smart filters (diet, intolerances, time, meal type, calorie range), infinite scroll. |
| 📖 **Recipe detail** | Ingredients with US/metric toggle, servings adjuster (scales amounts in real time), instructions, per-serving nutrition. |
| 🍳 **Cook Mode** | Edge-to-edge dark theme, one step at a time, very large type, screen wake-lock active so the phone doesn't sleep at the counter. |
| ❤️ **Favorites** | Save recipes locally — full data cached for offline. Search-within-favorites, remove with undo. |
| 🥬 **Fridge** | Add ingredients on hand, find recipes ranked by how few extras you'd need to buy. |
| ⚙️ **Preferences** | Diet defaults, intolerances (always applied), units, calorie goal. Auto-saves. Export your data, clear it on demand. |

## Run it locally

You need:

- Node 20+ (see [`.nvmrc`](.nvmrc))
- A free [Spoonacular API key](https://spoonacular.com/food-api)
- The Vercel CLI: `npm install -g vercel`

```bash
git clone <this repo>
cd meal-recipe-app
npm install
```

The Spoonacular API key never enters the client bundle — it's used by a
Vercel Serverless Function. Set it via the Vercel dashboard for the linked
project, then pull it into `.env.local`:

```bash
vercel link            # link to your Vercel project (one-time)
vercel env pull .env.local
```

Or skip Vercel for local-only and just create `.env.local` by hand:

```
SPOONACULAR_API_KEY=your-key-here
```

(no `VITE_` prefix — that would expose the key in the client bundle.)

Run the dev server:

```bash
vercel dev
```

Open the URL Vercel announces (typically `http://localhost:3000`). Use
`vercel dev`, not `npm run dev` — plain Vite has no idea how to serve the
`/api/spoonacular` function, so search will fail.

## Install Skillet on your device

The app is a real PWA — installable on phone or desktop.

- **iOS Safari**: open the site, tap **Share**, choose **Add to Home Screen**.
- **Android / Chrome / Edge / Brave**: a banner appears once Skillet meets
  the PWA install criteria, or use the browser menu's "Install Skillet…"
  entry. There's also an **Install** button on the Preferences screen.
- **Long-press the home-screen icon** (Android) for shortcuts that jump
  directly to Search, Saved, or Fridge.

Once installed, Skillet runs full-screen with the brand splash. Saved
recipes work offline — perfect for the kitchen.

## Architecture (in two paragraphs)

**Local-first for user data.** Favorites, preferences, fridge contents, and
fully-cached recipe data all live in IndexedDB (via Dexie) on the device.
There is no backend for user data, no accounts, no sync. The user installs
the PWA, all their data stays with them. A "Clear data" button in
Preferences removes everything.

**One server-side dependency, behind a proxy.** Spoonacular powers recipe
search and details. The browser never talks to Spoonacular directly —
every API call goes through a Vercel Serverless Function at
`/api/spoonacular` that attaches the API key server-side, edge-caches
common queries (search 1h, autocomplete 6h, recipe info 24h), and returns
402/429 quota errors gracefully. The proxy keeps the key on the server, so
a public portfolio piece can survive without bots burning the 150-pt/day
free tier in seconds.

## Secrets handling — and why it matters

| Where | What | Why |
|---|---|---|
| `.env.local` (gitignored) | `SPOONACULAR_API_KEY=…` | Read by the Vercel Function locally during `vercel dev`. |
| Vercel dashboard → Settings → Env vars | `SPOONACULAR_API_KEY` (Production + Preview + Development) | Used by deployed Vercel Functions. **Don't** mark Sensitive — Sensitive vars can't be pulled to local dev. |
| **NOT** anywhere with a `VITE_` prefix | — | A `VITE_` var is baked into the client bundle and visible in DevTools. The whole point of the proxy is to keep the key off the client. |

If you ever expose the key (`VITE_…` typo, committed `.env`, etc.), rotate
it in the Spoonacular dashboard immediately.

## Offline behavior

Once installed (or after the service worker registers on a regular
browser):

- **App shell** (HTML/CSS/JS) is precached. The app loads cold-offline.
- **Saved recipes** load from IndexedDB. Detail page, ingredients,
  instructions, nutrition — all available without a connection.
- **Recipe images** from Spoonacular's CDN cache via the service worker
  (CacheFirst, ~50 MB / ~30 days, LRU).
- **Search, autocomplete, fridge matching, and unsaved recipe detail
  pages** require a connection. When offline, the app gracefully shows a
  "You're offline — your saved recipes work without a connection" message
  with a "Browse saved" CTA.

When a new version of Skillet ships, the service worker installs in the
background and the user gets a small "A fresher version is ready · Refresh"
banner — no auto-reload mid-task.

## Building for production

```bash
npm run build
```

Outputs to `dist/`. Vercel auto-detects the framework on deploy — no extra
config needed beyond linking the project. To preview the production build
locally:

```bash
npm run preview
```

## Project documentation

| File | What it is |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Persistent context for Claude Code. Locked decisions, style guide, communication norms. |
| [`docs/build-prompt.md`](docs/build-prompt.md) | The original build brief (Role / Task / Context / Constraints / Format). |
| [`docs/design-handoff/`](docs/design-handoff/) | Design bundle from Claude Design — tokens, components, screens. |
| [`docs/decisions.md`](docs/decisions.md) | Running log of build-time choices not pre-decided in the brief. **Read this first if something looks weird** — it likely explains why. |
| [`WISHLIST.md`](WISHLIST.md) | Deferred items earmarked for slice 9 (polish) or v2. |

## Known limitations

- **Search/Fridge cost API points** — even with the session cache and
  Vercel edge cache, the free tier's 150-pt/day budget can run out under
  heavy use. The app surfaces quota errors calmly and steers toward saved
  recipes when that happens.
- **Light mode only** in v1. Cook Mode has its own dark theme; everywhere
  else is light. Dark mode lands in v2.
- **No grid/list toggle on the favorites screen** — design has both, v1
  ships grid only. See WISHLIST.
- **iOS splash screens** aren't generated as PNGs yet. iOS will use the
  manifest's background color + icon, which works but isn't pixel-perfect.

## v2 candidates

See [`WISHLIST.md`](WISHLIST.md) for the full list. Headliners:

- Dark theme + theme picker
- Top-level error boundary
- Import (counterpart to the existing Export)
- Cook Mode timer card with countdown
- Sort dropdown on Search
- Favorites view-toggle (grid/list) and dynamic category chips

## License

TBD — building for portfolio + personal use; not currently distributed.
