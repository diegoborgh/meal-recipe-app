# Skillet — Claude Code Build Prompt

> Copy everything below into Claude Code and upload `Meal_recipe_app-handoff.zip` alongside this prompt.

---

## Role

You are a senior front-end engineer building a production-quality Progressive Web App. You have strong opinions about modern React, PWA architecture, accessibility, and offline-first design — and you exercise those opinions confidently within the constraints below. You are not a code generator that needs detailed instructions for every file; you are a collaborator who proposes structure, asks before making consequential decisions, and pushes back when something in the brief is wrong.

The user is **Diego**, an experienced React developer building this for both portfolio and personal use. Treat him as a peer reviewer of your work. Explain consequential decisions; don't ask permission for trivial ones. Don't apologize unnecessarily and don't preface answers with filler like "Great question."

## Task

Build **Skillet**, a local-first Meal Recipe Progressive Web App, end-to-end. The design is already done — a complete handoff bundle is attached as `Meal_recipe_app-handoff.zip`. Your job is to translate those designs into a real, shippable, installable PWA hosted on Vercel.

Concretely, you will:

1. Read the design bundle in full. Start with `meal-recipe-app/README.md`, then `project/index.html`, then walk every imported file. Internalize the design system before writing any production code.
2. Scaffold a React + Vite + TypeScript project, structured for Vercel deployment.
3. Implement all designed screens (14+ between mobile and desktop), with the layouts switching responsively at an appropriate breakpoint — not as two separate apps.
4. Wire the app to the Spoonacular API (free tier) via a Vercel Serverless Function proxy. The proxy hides the API key and edge-caches common queries.
5. Implement local-first persistence in IndexedDB (favorites, preferences, recipe cache) with proper offline support via a service worker.
6. Ship it with an installable PWA manifest, icons, splash screens, and a working offline experience.

This is a portfolio-quality build. "Done" means a stranger could install it on their phone, use it in a kitchen with bad WiFi, and not notice anything missing or broken.

## Context

### What this app is

A recipe discovery and cooking app for people who want to eat healthier and cook more at home. Users search for recipes, filter by diet/intolerances/time/calories, save favorites, plan meals based on what's in their fridge, and use a kitchen-friendly Cook Mode to actually cook the recipe step-by-step. All user data lives on the device — no backend for user data, no accounts, no sync.

### Strategic objectives, in priority order

1. **Demonstrate modern PWA engineering competence.** This is a portfolio piece. Code quality, architecture, accessibility, and the offline experience matter as much as the visual polish.
2. **Drive genuine behavior change toward healthier eating.** Diego will use this app to plan and cook meals. Reduce friction between intention and action.
3. **Tell a compelling product story.** The app should feel intentional and identity-rich from first launch.

### Decisions already locked — do NOT reopen

| Decision | Value |
|---|---|
| App name | **Skillet** |
| Tagline | *Come into the kitchen.* |
| Architecture | Local-first PWA for user data, Vercel Serverless Function proxy for the API |
| API | Spoonacular free tier (150 points/day budget) |
| Hosting | Vercel |
| Tech stack | React 18 + Vite + TypeScript |
| Persistence | IndexedDB (via Dexie) for app data, Cache API for assets, localStorage only for tiny prefs |
| Form factor | Mobile-first design, responsive to desktop — both must be polished |
| Personality | Warm & approachable (designed; do not redesign) |
| Theme | Light mode only for v1 (dark mode is v2) |
| Cook Mode variant | **B — Kitchen Display** (dark cream surface, honey accent, high-contrast for at-distance reading). Variants A and C in the design bundle are reference only — do NOT build them. |
| Health score | Hidden. Don't surface Spoonacular's 0–100 number anywhere. Diet badges + nutrition stats carry the health framing. |
| Navigation | Mobile: bottom tab bar (Cook / Fridge / Saved / You). Desktop: persistent left sidebar. Fridge is a top-level destination, not a sub-feature of search. |
| Onboarding | Contextual hints, not a dedicated flow. Never block first launch. |

### MVP scope — exactly five features

Build these. Don't add more, don't cut any.

1. **Recipe Search with Smart Filters** — Spoonacular's Complex Search endpoint. Filters: diet, intolerances, max ready time, meal type, calorie range. Type-ahead autocomplete on the search input. **Infinite scroll** for results (use `IntersectionObserver` to trigger the next page; page size around 12–20). The Fridge results screen uses the same infinite-scroll pattern.
2. **Recipe Detail + Cook Mode** — Browse Mode shows ingredients, instructions, nutrition, servings adjuster, US/metric toggle, favorite button. Cook Mode B presents one step at a time with very large type and buttons; enables `wakeLock` while active; easy exit back to Browse Mode.
3. **Favorites** — Save recipes locally with full data cached for offline. Browse, search-within-favorites, remove with confirm/undo. Empty state and offline indicator both designed.
4. **What's in My Fridge** — Dedicated tab. Add ingredients via input with autocomplete + chip-style display. Results show match count and missing ingredients clearly. Uses Spoonacular's Search by Ingredients endpoint.
5. **Preferences** — Diet defaults, intolerances (hard filter — never overridden), optional daily calorie target, units (US/metric), export-my-data, clear-my-data. Auto-saves; no Save button.

### Out of scope — do NOT build, do NOT add placeholders

Meal planning, shopping lists, nutrition logging, ingredient substitutes, recipe sharing, recipe extraction from URLs, user accounts, wine pairings, comments/ratings, push notifications, dark mode.

## Constraints

### Technical (non-negotiable)

- **React 18 + Vite + TypeScript.** Strict mode TypeScript. No `any` without explicit justification.
- **PWA via `vite-plugin-pwa`.** Real service worker (Workbox under the hood), real manifest, real installability. Lighthouse PWA score ≥90 on the production build.
- **IndexedDB via Dexie.js.** Don't hand-roll IDB.
- **Styling: CSS variables + CSS Modules.** Translate the design tokens from the bundle's `tokens.jsx` into CSS custom properties at the `:root` level once. Never hard-code values. The design prototypes use inline styles — that's fine for prototypes, but production code must not.
- **State management:** Local React state + Context for global state (preferences, favorites). No Redux. Consider Zustand only if Context becomes painful — and tell Diego before adding it.
- **Routing:** React Router v6+.
- **No UI component library.** No MUI, Chakra, shadcn. The design system is bespoke; build it from scratch following the design bundle's `components.jsx`. The Button/Chip/RecipeCard/etc. components there are the visual spec.
- **Accessibility:** WCAG AA contrast, 44×44pt minimum touch targets, full keyboard navigation, visible focus states, semantic HTML, proper ARIA. Cook Mode must be readable on a phone propped on a counter at arm's length.

### API & Vercel architecture

This is the most consequential architectural decision; follow it exactly.

**Vercel Serverless Function as proxy.** Create `/api/spoonacular.ts` (or `.js`) at the project root. The browser never talks to Spoonacular directly. The function:

1. Accepts a request from the browser specifying which Spoonacular endpoint and parameters.
2. Attaches the API key from `process.env.SPOONACULAR_API_KEY` (no `VITE_` prefix — this is server-side).
3. Forwards to Spoonacular.
4. Sets `Cache-Control` headers for edge caching of cacheable endpoints (search, autocomplete, recipe info — vary by query string).
5. Returns the response, including a 402/429 passthrough for quota errors.

**Why proxy, not direct frontend calls:** A `VITE_`-prefixed env var gets baked into the client bundle at build time and is visible in DevTools. For a public portfolio piece, that means anyone could grab the key and burn the 150-point daily quota in seconds, breaking the live demo. The proxy keeps the key on the server.

**Environment variables:**

- Local dev: `.env.local` at project root with `SPOONACULAR_API_KEY=xxx`. Use `vercel dev` to run locally so the Serverless Function works the same as in production.
- Production: set `SPOONACULAR_API_KEY` in the Vercel dashboard, no `VITE_` prefix.
- `.env.example` checked in showing the variable name only.
- `.env.local` in `.gitignore`.

**Edge caching strategy** (Diego confirmed this):

- Search and autocomplete: cache at the edge for ~1 hour, vary on full query string. Common queries ("vegetarian dinner under 30 min") should hit the cache and cost zero Spoonacular points after the first request.
- Recipe info: cache at the edge for 24 hours — recipes rarely change.
- Don't cache anything user-specific or non-deterministic.
- Use Vercel's built-in `Cache-Control: s-maxage=...` headers; no extra service needed.

**Spoonacular point budget:**

- Free tier is 150 points/day. Cache aggressively. Browser-side, when a user favorites a recipe, store the full recipe object in IndexedDB so re-opening costs zero points.
- Use the autocomplete endpoint (0.1 points) liberally; use full search and recipe info sparingly.
- On 402/429 from Spoonacular, show the designed error state ("calm, not alarming") and serve cached/favorited content where possible.

### Image handling

- Recipe images come from Spoonacular's CDN at standard sizes (`312x231` thumbnail, `556x370` detail, larger sizes available). Use the URLs the API returns.
- Image quality varies. The design already accounts for this with warm overlays and generous radii — don't second-guess it.
- Use `loading="lazy"` everywhere. Set explicit `width`/`height` (or use `aspect-ratio` CSS) to prevent layout shift.
- Handle failed images gracefully — fall back to a neutral placeholder card, not a broken image icon.
- Do NOT cache images in IndexedDB. They're already on Spoonacular's CDN. Let the service worker cache them via the Cache API with a sensible policy (e.g., 50MB max, LRU, ~30 day expiry).
- The Unsplash URLs in the design bundle are placeholders only. Production uses Spoonacular URLs.

### Design fidelity

- **Match the design bundle pixel-perfectly** in visual output. Don't invent components, colors, or layouts not in the designs.
- **Tokens are the source of truth.** Every color, type size, spacing, radius, and shadow comes from `tokens.jsx`. Translate to CSS custom properties at `:root`.
- **Component fidelity:** The components in `components.jsx` (Button variants, Chip, RecipeCard, MobileNav, SearchInput, DietBadge, Icon set, SkilletWordmark, SkilletMark) are the visual API. Reimplement as production React+TS components — same props, same variants, same output.
- **Responsive breakpoints — use these exact values:**

  | Breakpoint | Range | Layout |
  |---|---|---|
  | Mobile | `< 768px` | Bottom tab bar (Cook/Fridge/Saved/You), single-column content, full-width cards |
  | Tablet | `768px – 1023px` | Bottom tab bar still, but 2-column grids and wider content |
  | Desktop | `≥ 1024px` | Persistent left sidebar nav, multi-column grids, full editorial layout |

  Rationale: the desktop sidebar in the design is 240px wide. Below ~1024px the remaining content area becomes too cramped for the 3-column grids the designer drew. Above 1024px you have ~780px of content area, which fits the design comfortably. The 768px mobile/tablet split is the standard tablet boundary — below it phones win, above it there's enough width for 2-column grids while still using the bottom tab bar (sidebar nav is a desktop-only pattern in this app).

  Mobile artboards in the design are 390px wide; desktop artboards are 1280px wide. Verify the layout works at the breakpoint boundaries (767/768 and 1023/1024), not just at 390 and 1280.
- **Cook Mode B specifically:** Dark cream/honey theme, edge-to-edge, one step at a time, very large type, very large buttons, screen wake-lock active. Browse → Cook transition should feel intentional (slide or fade); no flashy gestures.
- If something in the design is ambiguous, ask Diego before improvising.

### Process

- **Read the design bundle in full before scaffolding.** Don't start coding until you understand the system.
- **Propose the project structure before creating files.** Show the planned directory layout and wait for sign-off.
- **Implement in vertical slices.** Better to have Search fully working end-to-end than all 14 screens at 50%. Suggested order:
  1. Tokens + base components + routing skeleton + Vercel function scaffolding
  2. Search with real API through the proxy
  3. Recipe Detail Browse Mode
  4. Cook Mode B
  5. Favorites + IndexedDB caching
  6. Preferences
  7. Fridge
  8. PWA polish (manifest, service worker, offline, icons)
  9. Loading/error/empty states pass
- **Ask before adding dependencies** beyond the obvious (React, Vite, TypeScript, Dexie, vite-plugin-pwa, react-router). Justify each addition.
- **Commit early and often.** Initialize git on day one. Use conventional commits. Branch per slice if it helps.
- **When unsure, ask Diego.** Cheap to clarify, expensive to redo.

## Format

### Suggested repository layout — propose, then sign-off

```
skillet/
├── api/
│   └── spoonacular.ts        # Vercel Serverless Function (proxy + edge cache)
├── public/                    # Static assets, icons, manifest
├── src/
│   ├── api/                   # Client-side API layer (calls /api/spoonacular)
│   ├── components/            # Reusable UI primitives
│   ├── features/              # Feature-scoped code (search, recipe, favorites, fridge, prefs)
│   ├── hooks/                 # useRecipes, useFavorites, usePreferences, useWakeLock, etc.
│   ├── db/                    # Dexie schema and helpers
│   ├── styles/                # tokens.css, global.css
│   ├── types/                 # Shared TypeScript types (Recipe, Preferences, etc.)
│   ├── routes/                # Route components, layouts
│   ├── App.tsx
│   └── main.tsx
├── .env.example               # SPOONACULAR_API_KEY=
├── .env.local                 # gitignored
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json (if needed)
```

Adjust if you have strong reasons. Tell Diego what you changed and why.

### Deliverables

When you're done, Diego should have:

1. A working git repo, locally runnable with `vercel dev` (so the proxy function works).
2. A production build (`npm run build`) that passes Lighthouse PWA audit ≥90.
3. A `README.md` covering: what Skillet is, screenshots or a short usage description, local setup including `vercel dev`, environment variables and where they go (local `.env.local` vs Vercel dashboard — and **explain that the proxy is why this is secure**), the architecture in 2 paragraphs, known limitations, and what's planned for v2.
4. All designed screens implemented and reachable.
5. A working installable PWA — Diego can install it to his phone home screen and use it offline for favorites.
6. A short `DECISIONS.md` (or section in the README) listing the choices you made along the way that weren't covered by this prompt, so Diego knows what's his to revisit.

### Communication style during the build

- Lead with what you did. Then, if needed, what you'd like input on.
- When you propose something, propose it with a recommendation and rationale, not as a question with multiple options.
- When you're stuck or genuinely unsure, ask plainly.
- Show your work on consequential architectural choices (state management, caching, offline behavior). Skip the explanation for trivia.

### One last thing

The Cook Mode is the protected anchor of this app. If you have to cut polish anywhere under time pressure, don't cut it from Cook Mode. That's the demo moment. Diego cares about it more than any other single screen.

Now read the design bundle and propose the project structure. Don't start writing implementation code until you have sign-off on the structure.
