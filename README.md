# Skillet

A local-first Meal Recipe Progressive Web App. *Come into the kitchen.*

> **Status:** Project scaffolded, build in progress.

## Quick start (for Claude Code)

If you're opening this project in Claude Code: read `CLAUDE.md` first. It auto-loads on session start and tells you what to read next.

## Quick start (for humans)

```bash
# Install dependencies (once package.json exists)
npm install

# Run locally with the Vercel proxy active
vercel dev
```

> Note: use `vercel dev`, not `npm run dev`. The Spoonacular API proxy is a Vercel Serverless Function that needs the Vercel runtime to work locally.

## Environment

Copy `.env.example` to `.env.local` and add your Spoonacular API key. For production, set `SPOONACULAR_API_KEY` in the Vercel project dashboard.

## Project documentation

| File | What it is |
|---|---|
| `CLAUDE.md` | Persistent context for Claude Code. Locked decisions, style guide, communication norms. |
| `docs/build-prompt.md` | The original build brief (Role / Task / Context / Constraints / Format). |
| `docs/design-handoff/` | The complete design bundle from Claude Design. Tokens, components, screens. |
| `docs/decisions.md` | Running log of build-time choices not pre-decided in the brief. |

## Architecture in two paragraphs

Skillet is a local-first PWA. All user data — favorites, preferences, recipe cache — lives in the browser via IndexedDB (Dexie). There is no backend for user data, no accounts, and no sync. The user installs the PWA to their phone and uses it as a kitchen-side cooking assistant.

The Spoonacular API is the one server-side dependency, accessed through a Vercel Serverless Function at `/api/spoonacular` that proxies requests, attaches the API key server-side, and edge-caches common queries. The browser never sees the API key. This keeps the architecture honest about being local-first for *user data* while still solving the practical problem of a public portfolio piece needing to protect its API quota.

## License

TBD.
