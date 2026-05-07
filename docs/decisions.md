# Decisions Log

A running log of decisions made during the Skillet build that weren't pre-decided in `CLAUDE.md` or `docs/build-prompt.md`. The point is to make Diego's "what's mine to revisit later?" question easy to answer.

Entries should be brief. Format:

```
## [Date] — Short title
**Decision:** What was decided
**Why:** Brief rationale
**Reversible?** Yes / No / With effort
```

---

## 2026-05-05 — Project structure (slice 1)
**Decision:** Adopted the structure proposed in the slice-1 sign-off, with these deltas vs build-prompt.md's suggestion:
- `src/features/<feature>/` holds screen-local components (FilterGroup, IngredientRow, MacroPill); shared `src/components/` stays 1:1 with `components.jsx`.
- `src/lib/` for pure helpers (formatting, units, scaling); `src/hooks/` for React-aware only. No `utils/` junk drawer.
- `src/pwa/` isolates SW registration from `main.tsx`.
- `src/context/` provider folder, separate from `hooks/`.
- `routes/` holds both layouts (`RootLayout`, `CookModeLayout`) and route components.
- No tests scaffolded in v1 (skip Vitest until first Dexie bug).
- No root `DECISIONS.md` — this file (`docs/decisions.md`) is canonical.
**Why:** Tighter shared-primitive set; clearer separation of pure vs React utilities; one responsive layout, not two.
**Reversible?** Yes — folder moves are mechanical.

## 2026-05-05 — Cook Mode theme via global `.cook-mode` class
**Decision:** Cook Mode B's dark cream / honey theme is delivered by overriding the same CSS custom properties (`--color-bg`, `--color-ink`, `--color-accent`, etc.) under a `.cook-mode` class scope in `tokens.css`. CookModeLayout applies the class to its root.
**Why:** Keeps every component theme-agnostic; the theme switch is one class flip; no parallel stylesheets.
**Reversible?** Yes.

## 2026-05-05 — Strict TypeScript with `exactOptionalPropertyTypes`
**Decision:** `tsconfig.app.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`.
**Why:** Catches passing `undefined` into optional props that don't accept it — common React footgun. Forces props to declare nullability explicitly.
**Reversible?** Yes (loosen tsconfig).

## 2026-05-05 — Spoonacular proxy: endpoint allowlist + per-endpoint cache TTLs
**Decision:** `api/spoonacular.ts` doesn't blanket-forward — only five known endpoints are allowed: complexSearch, autocomplete, findByIngredients, recipes/{id}/information, ingredients/autocomplete. Each has its own `s-maxage` + `stale-while-revalidate`.
**Why:** Keeps the proxy from becoming a free relay against our key. Per-endpoint TTLs match Diego's cache plan in build-prompt.md (search 1h, info 24h, autocomplete 6h).
**Reversible?** Yes — config object at the top of the function.

## 2026-05-05 — Added `sharp` as a devDependency for icon generation
**Decision:** Added `sharp` and a `scripts/generate-icons.mjs` that rasterizes the master `public/icons/icon.svg` and `icon-maskable.svg` into the four PNG sizes the manifest needs (192, 512, maskable 512, apple-touch 180). Run with `npm run gen:icons`.
**Why:** Manifest needs PNGs for cross-platform installability (especially iOS) and Lighthouse PWA score. Generating from one SVG keeps the source-of-truth single. Sharp is build-time only — never imported by runtime code.
**Reversible?** Yes — drop sharp + the script if we switch to a different rasterizer or ship SVG-only icons.

## 2026-05-06 — URL is the source of truth for search filter state
**Decision:** SearchRoute reads filter state via `useSearchParams` and writes back through `setSearchParams`. The reducer (`filtersReducer`) is pure; route code derives current filters per render from the URL and projects each action through the reducer + serializer.
**Why:** Back/forward navigates filter history naturally; deep links work; no stale local state to reconcile against the URL. The mobile FiltersSheet still uses a local `useReducer` for its draft (so chip toggles inside the sheet don't fire one search per click) and only commits via Apply.
**Reversible?** Yes — could move to local state if URL sync becomes constraining.

## 2026-05-06 — Diet is single-select; intolerances are multi
**Decision:** UI mirrors Spoonacular's API: `diet` is a single value, `intolerances` is comma-separated. Toggling a different diet replaces the selection; toggling an intolerance adds/removes it.
**Why:** Spoonacular's complexSearch only accepts one `diet` value. Faking multi-select would silently drop selections.
**Reversible?** No — would require a different upstream provider.

## 2026-05-06 — Sort options deferred from MVP
**Decision:** Search is hard-coded to `sort=popularity` (or `sort=random` for the Home "Tonight's picks" strip). The "Sort: Best match" dropdown shown in the design is not built. The Filters type carries a `sort` field so we can expose it without re-plumbing later.
**Why:** Sort isn't in the locked MVP feature list. Adding it would expand surface area for marginal value before Recipe Detail and Cook Mode are built. Keep slice 2 scoped.
**Reversible?** Yes — wire a SortDropdown component when needed.

## 2026-05-06 — Spoonacular complexSearch flags
**Decision:** Every complexSearch call is made with `addRecipeInformation=true`, `addRecipeNutrition=true`, `instructionsRequired=true`. Page size is 12 (within the 12–20 range from build-prompt.md).
**Why:** RecipeCard needs `readyInMinutes` + calories + the boolean flags for diet badges. Without `addRecipeInformation` we'd need a second per-recipe call. `instructionsRequired` filters out recipes we couldn't show in Cook Mode anyway.
**Reversible?** Yes — three flags in `src/api/search.ts`.

## 2026-05-05 — Added `@vercel/node` as a devDependency
**Decision:** Pulled in `@vercel/node` for `VercelRequest` / `VercelResponse` types in `api/spoonacular.ts`.
**Why:** Standard package for typing Vercel Serverless Functions; not flagged as "obvious" in the build prompt but it's the official source of those types.
**Reversible?** Yes — we could hand-roll request/response types instead.

---
