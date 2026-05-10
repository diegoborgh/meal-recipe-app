# Skillet — Project Context for Claude Code

This file is auto-loaded by Claude Code at the start of every session. Keep it short and pointer-heavy. Detailed context lives in the files this points to.

---

## What this is

**Skillet** is a local-first Meal Recipe Progressive Web App, hosted on Vercel. The user ("Diego") is an experienced React developer building this for both portfolio and personal use. Treat him as a peer reviewer.

Tagline: *Come into the kitchen.*

## Tech stack

- React 18 + Vite + TypeScript (strict mode)
- Dexie.js for IndexedDB
- vite-plugin-pwa for service worker + manifest
- React Router v6+
- CSS Modules + CSS custom properties (no UI library)
- Vercel Serverless Function for the Spoonacular API proxy
- Hosted on Vercel

## Required reading before making changes

In this order:

1. `docs/build-prompt.md` — the full build brief (Role / Task / Context / Constraints / Format)
2. `docs/design-handoff/README.md` — entry point for the design bundle
3. `docs/design-handoff/project/index.html` — design canvas entry, shows what loads
4. `docs/design-handoff/project/tokens.jsx` — design tokens (source of truth for ALL visuals)
5. `docs/design-handoff/project/components.jsx` — component visual spec
6. `docs/decisions.md` — running log of build-time decisions; consult before reopening choices

The design bundle has more files (screens, recipes, app shell). Read them as needed, but the four above are the foundation.

## Locked decisions — do NOT reopen

These were settled during strategic planning. Don't relitigate them.

| Decision | Value |
|---|---|
| App name | Skillet |
| Cook Mode variant | **B only** (Kitchen Display — dark cream / honey). A and C in the design bundle are reference only. |
| Health score | Hidden everywhere. Diet badges + nutrition stats carry the health framing. |
| Theme | Light mode only for v1. Dark mode is v2. |
| Breakpoints | `<768px` mobile, `768–1023px` tablet, `≥1024px` desktop |
| Pagination | Infinite scroll (IntersectionObserver, page size 12–20) |
| Navigation | Mobile: bottom tab bar (Cook / Fridge / Saved / You). Desktop: persistent left sidebar. |
| API architecture | Vercel Serverless Function at `/api/spoonacular` proxies all Spoonacular calls. Key never enters the client bundle. |
| Edge caching | Yes — search/autocomplete cache ~1hr, recipe info cache 24hr, vary by query string |
| Persistence | IndexedDB (Dexie) for app data, Cache API for assets, localStorage for tiny prefs only |
| MVP scope | Five features only: Search, Recipe Detail + Cook Mode, Favorites, Fridge, Preferences |
| Out of scope | Meal planning, shopping lists, accounts, dark mode, push notifications — see build-prompt.md |

## Style guide

- TypeScript strict mode. No `any` without explicit justification.
- CSS Modules + CSS custom properties translated from `tokens.jsx`. Never hard-code design values.
- No UI component library (no MUI, no Chakra, no shadcn). The bespoke design system in `components.jsx` is the spec.
- Match the design bundle pixel-perfectly. Don't invent components or colors.
- Conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- Accessibility is non-negotiable: WCAG AA contrast, 44×44pt touch targets, keyboard navigation, visible focus states.

## Git workflow

- **Commit straight to `main`** — this is a solo portfolio repo, branches per slice would be ceremony. This OVERRIDES the default "if on the default branch, branch first" behavior.
- Push when Diego asks ("push to GitHub", "deploy", "let's see it live"). Don't push every commit unprompted.
- Vercel auto-deploys on push to `main` — there's no separate deploy step.

## Build approach

Implement in vertical slices, not horizontal. Better to have one feature end-to-end than all features at 50%. See `docs/build-prompt.md` for the suggested slice order.

Before scaffolding the project, propose the directory structure and wait for Diego's sign-off.

## When in doubt

- Ask Diego before adding dependencies (beyond the obvious: React, Vite, TypeScript, Dexie, vite-plugin-pwa, react-router).
- Ask Diego before changing any locked decision above.
- Log decisions you make on your own (the ones not covered here) in `docs/decisions.md` so they're discoverable later.

## Communication style

- Lead with what you did. Then what you'd like input on.
- Propose with a recommendation and rationale, not as a question with options.
- Skip filler ("Great question," "I'd be happy to..."). Just answer.
- Don't apologize unless you broke something.

## The protected anchor

Cook Mode is the demo moment. If you have to cut polish anywhere under time pressure, don't cut it from Cook Mode.
