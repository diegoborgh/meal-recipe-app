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

## 2026-05-06 — Cook Mode theme: terracotta accent, honey highlight (corrected)
**Decision:** The `.cook-mode` token override was initially set to use honey as `--color-accent` (the action color). Updated to keep `--color-accent` as terracotta — matching the design's Next button — and treat honey as a highlight color (step number, active progress dot). Surfaces are translucent white overlays (`rgba(255, 255, 255, 0.06)`) on a warm-dark `#2A1F17` base.
**Why:** The first pass misread the design. With honey as accent, components rendered under cook-mode would have changed all primary affordances to yellow instead of staying terracotta — wrong visual hierarchy. The corrected scope means our shared Button/Chip/etc. work correctly under cook-mode without any conditional code.
**Reversible?** Yes — single CSS block in tokens.css.

## 2026-05-06 — Cook Mode keyboard nav: Right/Space/Enter advance, Left back, Esc exit
**Decision:** `useCookNavigation` listens on `window` for arrow keys, Space, Enter, Esc. Editable elements (inputs, contenteditable) are exempt. Esc bubbles up via `onExit` so the route can decide what to do (e.g. close the ingredients peek before exiting Cook Mode).
**Why:** Cooking with the phone propped up sometimes means a keyboard or paired controller is closer than the screen. Multiple "advance" keys (Right / Space / Enter) all do the right thing without thinking. Esc-handled-by-caller lets us stack modals correctly.
**Reversible?** Yes.

## 2026-05-06 — Wake Lock fails silently on unsupported browsers
**Decision:** `useWakeLock` requests `navigator.wakeLock.request('screen')` on mount and silently no-ops where the API isn't available (Safari before 16.4, some desktop Linux). Re-acquires on `visibilitychange` because the OS releases the lock when the tab is hidden.
**Why:** Cook Mode is still usable without the lock — the screen just dims as normal. Throwing or warning would be punishing the user for browser limitations they can't fix.
**Reversible?** N/A — graceful degradation is the intended behavior.

## 2026-05-06 — Cook Mode "Done" on the last step navigates back to Browse
**Decision:** On the last step, the Next button becomes "Done" (honey, check icon) and fires `onDone` instead of `onNext`. `onDone` navigates back to `/recipe/:id`. Same destination as the close button.
**Why:** The build prompt notes: "easy exit back to Browse Mode." A natural gesture at the end of cooking is to close out — making "Done" do that automatically removes a friction step. The honey color (vs terracotta) signals completion, not advancement.
**Reversible?** Yes.

## 2026-05-06 — Recipe detail: servings + units are local UI state, not preferences
**Decision:** On Recipe Detail, the `ServingsAdjuster` and `UnitToggle` mutate component-local state only. Units initializes from `preferences.units` at mount but doesn't write back; servings always initializes to the recipe's original count.
**Why:** A user looking at one recipe in metric shouldn't change their global default. Servings shouldn't persist either — every recipe arrives at its own original count.
**Reversible?** Yes — wire `setPreferences` into the toggle if behavior should change.

## 2026-05-06 — Servings scaling preserves units; we don't unit-convert ourselves
**Decision:** When the user adjusts servings, we scale the numeric `amount` only. Units stay as Spoonacular returned them. For the US/Metric switch, we read the right pre-converted measure from `extendedIngredients[i].measures.us|metric` rather than running our own conversion.
**Why:** Spoonacular has already done unit-aware conversions per ingredient — applying our own would risk double-conversion bugs and lose Spoonacular's unit choices ("can (15 oz)" vs "g"). Numeric scaling is mathematically safe.
**Reversible?** With effort — would require a custom conversion layer.

## 2026-05-06 — Plain text instructions only; no rendered HTML from the API
**Decision:** `extractSteps` prefers `analyzedInstructions[].steps[].step` (plain text). Falls back to a coarse sentence-split of the HTML `instructions` field with tags stripped — never `dangerouslySetInnerHTML`.
**Why:** Spoonacular content is third-party; rendering its HTML on a route that loads any user-supplied id from the URL would be an XSS hole. Coarse split is fine for a fallback.
**Reversible?** Yes — wire DOMPurify if we ever want richer fallback rendering.

## 2026-05-06 — `vercel.json` keeps framework + install/build only, no devCommand
**Decision:** `vercel.json` declares `framework: "vite"`, `installCommand`, `buildCommand`, `outputDirectory`, and nothing else. No `devCommand`.
**Why:** Setting `devCommand: "npm run dev"` made `vercel dev` run Vite as a passthrough without starting Vercel's own server — so `/api/spoonacular` was unreachable locally even though Vite came up on 5173. Removing `devCommand` lets Vercel auto-detect Vite, mount the API function, and serve the combined stack on its own port (default 3000).
**Reversible?** Yes — re-add `devCommand` if a future framework change requires it, but verify `vercel dev` still announces its own port.

## 2026-05-05 — Added `@vercel/node` as a devDependency
**Decision:** Pulled in `@vercel/node` for `VercelRequest` / `VercelResponse` types in `api/spoonacular.ts`.
**Why:** Standard package for typing Vercel Serverless Functions; not flagged as "obvious" in the build prompt but it's the official source of those types.
**Reversible?** Yes — we could hand-roll request/response types instead.

---
