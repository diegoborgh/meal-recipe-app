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

## 2026-05-18 — Fridge cards: time + calories + diet badges + step-less filter (informationBulk enrich)
**Decision:** `FridgeCard` (mobile row + desktop card) now shows `25 min · 420 kcal` and the same diet badges (GF / Dairy-free / Vegan …) that search results carry, replacing the old truncated `Need: parsley, lemon, …` line. To populate any of this — and to filter out recipes with no cookable steps (parity with search) — `useFridgeRecipes` calls `enrichFridgeMatches` after `findByIngredients` resolves; it batches all match ids through the new `recipes/informationBulk` proxy endpoint (24h edge cache, same as `recipes/information`) with `includeNutrition=true`. The single bulk response yields all three things: time/calories (via `findNutrient` + `formatReadyTime`), badges (via `badgesFor`), and the cookable-steps check (via `hasCookableSteps`). Step-less recipes are dropped only when we actually got info back for that id — a missing-from-bulk id keeps its bare card rather than getting silently hidden. Matches render immediately with bare data, then re-render with the enriched (and filtered) copy when bulk info arrives. If the bulk call fails (quota, offline), we keep showing the unenriched matches and don't surface the error.
**Why:** This is what the design handoff specified for time + calories (`screens-mobile-2.jsx::FridgeCard`, `screens-desktop.jsx::D_Fridge`); diet badges weren't in the handoff but are consistent with the search RecipeCard vocabulary and Diego asked for parity. The step-less filter exists in the search path via `hasCookableSteps` because `complexSearch` returns `analyzedInstructions` inline; Fridge previously couldn't filter because `findByIngredients` doesn't carry that data — `informationBulk` does, so we get the filter for free now that we're already paying for the call. The `Need: …` line was a build-time stand-in that doesn't survive truncation.
**Cost:** Adds ~1 pt per match id (max 20) on top of `findByIngredients`. Acceptable because (a) edge cache absorbs repeat queries, (b) session cache caches the enriched + filtered result, (c) Fridge searches are explicit (button-gated), not auto-fired.
**Reversible?** Yes — revert the proxy allowlist entry + the enricher call to drop back to bare matches. The step-less filter would then return to its slice-3-era state (relying on the recipe detail route to handle dead-end recipes downstream).

## 2026-05-14 — Cook Mode timer alarm: WebAudio chime + vibrate, no Notification API (slice 3)
**Decision:** Timer completion fires a soft two-tone WebAudio chime (G5 + overlapping C6, ~1.4s, gentle envelope) via `src/features/cook/lib/alarm.ts`, plus a best-effort `navigator.vibrate([400, 200, 400, 200, 600])`. No Permission API, no `Notification.requestPermission()`, no service-worker push. Both APIs soft-fail (no try-block surfacing) on browsers that don't support them — same graceful-degradation pattern as `useWakeLock`. A persistent `TimerPill` floats above the BottomBar when the active timer's step isn't the user's current step, so a timer running on step 2 stays visible (and tappable to snap back) while the user advances to step 3 to chop. The pill shows `⏱ MM:SS → Step N` while counting, `⏱ Done → Step N` with a honey bg pulse when complete (animation respects `prefers-reduced-motion`). Also broadened `useCookNavigation`'s keyboard guard to skip BUTTON/A targets in addition to inputs/contenteditable — without this, pressing Space on a focused TimerCard button silently advanced the step instead of toggling the timer (latent same-issue existed for the BottomBar Back/Done buttons).
**Why:** v1 is light-mode-only, single-tab, no account — the Notification API's permission flow is heavy ceremony for a feature that only needs to alert the user while the tab is in the foreground (which is the only state Cook Mode targets — the wake lock holds the screen on). WebAudio's autoplay policy is satisfied because alarm playback is the downstream effect of a user-initiated Start tap, even if the actual sound fires inside a setInterval callback minutes later. Cross-step pill exists because without it the timer is technically running but practically invisible — the kitchen reality is "set the rice on step 2, advance to chop while it cooks." Tap-to-jump means the user can verify or interact with the timer in one gesture rather than back-arrowing through steps.
**Reversible?** Yes — drop the import + 1-line onComplete wiring to remove the alarm; remove the TimerPill mount + component to remove the cross-step surface. The keyboard guard expansion is additive and safe to keep regardless.

## 2026-05-14 — Cook Mode timer state lifted to CookRoute; single global timer (slice 2)
**Decision:** The optional Cook Mode timer's state machine lives on `CookRoute`, not inside `TimerCard`. Route-level `useState<ActiveTimer | null>` carries `{ stepIndex, totalSec, startedAt }`; a new `useCountdown` hook drives a 250ms re-render loop and computes `remainingSec` from `Date.now() - startedAt` (NOT by incrementing a counter — survives tab-hide and screen-lock without drift). Card state is derived: `'idle'` when no active timer or active timer is on a different step; `'running'` while counting; `'done'` when remainingSec hits zero. Tapping Start while a timer is already running on a different step triggers `window.confirm("Replace running timer?")` before overwriting. Exiting Cook Mode clears the timer — state does not persist across sessions. `useCountdown` exposes a latched `onComplete` (fires exactly once per `startedAt`) for slice 3's alarm to hook into.
**Why:** Only one timer can run at a time, but a kitchen reality is "set the rice on step 2, advance to step 3 to chop while it cooks." Lifting state to the route means the timer keeps counting across step navigation without prop-drilling through CookStep, and slice 3's cross-step pill can read the same state without duplication. Replace-confirm is the cheap safety net for the "I already had something on the stove" scenario — a 1-tap accident shouldn't silently nuke a running timer. Clear-on-exit beats persisting: a 2-hour-old "browning the onions" timer in `localStorage` would be more confusing than helpful. Wall-clock-based remaining time (vs incrementing) is non-negotiable for accuracy — `setInterval` callbacks are not guaranteed to fire while the tab is hidden, so any counter-based approach would drift dramatically on phones that screen-lock mid-cook.
**Reversible?** Yes — collapse the route-level state back into TimerCard if cross-step persistence is later judged unnecessary; the hook stays useful regardless.

## 2026-05-13 — Step duration carried through the Recipe type (Cook Mode timer, slice 1)
**Decision:** Replaced `Recipe.steps: string[]` with `Recipe.steps: RecipeStep[]` where `RecipeStep = { text: string; durationMinutes: number | null }`. `extractSteps` in `src/lib/format.ts` now reads Spoonacular's per-step `length: { number, unit }`, normalizes seconds/hours/minutes → whole minutes via `normalizeLength`, and clamps to 1–240 min to drop outliers. HTML-fallback steps all carry `durationMinutes: null`. CookStep mounts a static `TimerCard` (icon + "Optional timer · N min" label + non-functional "Start N:00" button) under the step text whenever `durationMinutes != null` — slice 1 ships the data plumbing and the idle visual only; the live countdown + alarm land in slices 2–3. Dexie back-compat is handled by a `coerceSteps()` helper in `src/db/favorites.ts` applied at the `useRecipe` read path (legacy `string[]` rows map to `[{ text, durationMinutes: null }]`); no schema bump, since the existing `upgradeFavorite` flow rewrites the row with the new shape on the next Recipe Detail visit.
**Why:** Preserving duration in the type shape (vs re-extracting on demand inside Cook Mode) keeps a single source-of-truth mapping in `format.ts` and lets every step-consuming component decide independently whether to surface the timer. Coercion-on-read (rather than a v2 Dexie migration) avoids forcing an `upgrade()` callback on every existing user for what's effectively a free upgrade: stale rows render fine — just without timer cards — until the natural detail-view refetch lands the structured data.
**Reversible?** Yes — `RecipeStep` is additive in the type system; revert by restoring `steps: string[]` plus the mechanical consumer updates. `coerceSteps` becomes a no-op once all favorited rows have been re-upgraded.

## 2026-05-12 — Desktop filter sidebar is collapsible (per design_handoff_collapsible_filter_sidebar)
**Decision:** SearchRoute's 280px desktop sidebar can be collapsed to a narrow rail, matching the handoff at `docs/design_handoff_collapsible_filter_sidebar/`. The handoff specs 64px; the rail was tightened per Diego — 56px width with 5px horizontal padding (button stays 44px and centers cleanly), `margin-left: -56px` to consume the RootLayout `.contentDesktop` left padding so the rail begins flush with the DesktopSidebar nav. Inner `.rail` flex column has `margin-top: -26px` (roughly cancels the rail's 28px `padding-top`, leaving 2px to nudge the button slightly below FILTERS for optical balance) so the button's top edge aligns with the inline "FILTERS" label of CollapsedFiltersBar. Filter column lands at ~85px total visual footprint. Rail contents: 44×44 round filter button with a count badge (accent bg, 2px bg-color ring) + vertical "FILTERS · N" label below. Expanded sidebar gets a small `←` chevron next to Reset to collapse from inside. Active-filter readout follows the sidebar state: when expanded, chips live inside the FiltersPanel; when collapsed, a `CollapsedFiltersBar` ("FILTERS" label + removable chips + "Edit all") renders inline above the recipe count. Page-header `ActiveFilterChips` is hidden on desktop entirely — mobile/tablet keep them. Results grid widens from 3 → 4 columns when collapsed (`wide` prop on ResultsGrid + ResultsSkeleton). **No persistence** — the sidebar resets to expanded on every page entry; the user can collapse mid-session but refresh starts clean. (The handoff suggested `localStorage`; Diego asked to skip it.) New component at `src/features/search/components/CollapsedFiltersBar.tsx`.
**Why:** Wishlist item. First pass used a fully-hidden sidebar with the existing Filters chip as re-open path; that was non-discoverable. Second pass used an icon rail that was on the right idea but undersized (44px). Third pass implemented the handoff faithfully (64px rail + `localStorage` persistence). Final tuning per Diego: tighter rail-column footprint via negative margin, and no persistence (expanded is the "calm" default — collapse should be an explicit per-session choice).
**Reversible?** Yes — drop the conditional, the CollapsedFiltersBar component, the rail CSS + negative margin, and the `wide` prop on ResultsGrid.

## 2026-05-10 — Top-level error boundary outside the providers
**Decision:** Added `src/components/ErrorBoundary` and mounted it in `main.tsx` outside `<App />`. Uses the React 18 class-component pattern (`getDerivedStateFromError` + `componentDidCatch`). Fallback UI is calm-not-alarming with Reload + Back-to-Cook CTAs and an expandable details block for the developer.
**Why:** Until this slice, any thrown render error blanked the entire tree (we hit this with the slice-7 Dexie `orderBy` bug — `useLiveQuery` rethrows errors and there was no boundary to catch). Now the user sees a recoverable surface with data intact (Dexie persists across reloads).
**Reversible?** Yes — drop the boundary; the tree blanks again on errors.

## 2026-05-10 — Bespoke layout-shaped skeletons for Recipe + Cook
**Decision:** Replaced generic `<LoadingState />` on RecipeRoute with `RecipeDetailSkeleton` whose layout matches the eventual page (hero, stats strip, macro pills, ingredient rows, step rows). Same treatment on CookRoute via `CookSkeleton` (massive number block + step text lines, in cook-mode translucent overlays).
**Why:** Generic spinners cause visible layout shift when content arrives. Layout-shaped skeletons make cold paint feel like the page filling in. Especially valuable on Cook Mode where the phone is propped up and any visual jolt is jarring.
**Reversible?** Yes — drop the components and revert to LoadingState.

## 2026-05-10 — Empty-state copy audit: navigation actions != retry
**Decision:** Several routes were using `onRetry` to render a "Try again" button when the action was actually navigation (SearchRoute "What sounds good?", RecipeRoute bad-id, CookRoute bad-id, CookRoute no-instructions, FridgeRoute no-matches). Switched to ErrorState's `action={…}` prop with honest labels ("Browse picks", "Back to Cook", "Back to recipe") or removed the button entirely.
**Why:** "Try again" implies a transient failure to retry; honest labels describe what the button actually does.
**Reversible?** Yes.

## 2026-05-09 — SW updates: prompt mode + UpdateBanner, no auto-reload
**Decision:** Switched `vite-plugin-pwa` from `registerType: 'autoUpdate'` to `'prompt'`. New SWs install in the background but a `UpdateBanner` (mounted at RootLayout) surfaces "A fresher version is ready · Refresh" — the user clicks Refresh to apply. A "Later" dismiss hides it for the session.
**Why:** Auto-update can swap the bundle mid-task (e.g. while reading a Cook Mode step) and the next navigation gets a different JS chunk. Surface the choice; let the user pick the moment.
**Reversible?** Yes — flip `registerType` back; the banner becomes a no-op.

## 2026-05-09 — Install prompt: native button on Chromium, manual instructions on iOS
**Decision:** `src/pwa/install.ts` captures `beforeinstallprompt` at app boot (before React mounts — Chromium fires early). The `InstallPrompt` component on the Preferences screen renders three states: `available` (button → triggerInstall), `installed` (small confirmation), or `unavailable` + iOS detected (Safari "Add to Home Screen" instructions). Renders nothing on platforms with no install path (desktop Firefox, etc.).
**Why:** A user on Chromium gets a single-tap install. iOS doesn't fire the event but supports manual install — instructions are better than silence. Hiding the surface entirely on unsupported platforms avoids dead UI.
**Reversible?** Yes.

## 2026-05-09 — Manifest shortcuts for the three top-level features
**Decision:** Added `shortcuts` to the manifest pointing at `/search`, `/favorites`, `/fridge`. Long-press the home-screen icon on Android for the menu; iOS ignores them (no-op there). Also added `categories`, `lang`, `dir`, `orientation`.
**Why:** Cheap to add, useful when supported, safe everywhere.
**Reversible?** Yes — drop the array.

## 2026-05-09 — Offline-aware error states route to "Browse saved" instead of "Try again"
**Decision:** Search / Fridge / Recipe / Home all detect `navigator.onLine` (via `useOnline()`) at error time. When offline + no cached results, the ErrorState shows an offline-specific copy and the action button becomes "Browse saved" (navigates to /favorites) instead of the default "Try again". Online path is unchanged.
**Why:** "Try again" is a poor affordance when the user fundamentally can't get a connection. Steering toward what they CAN do (saved recipes are always available) is the right product move.
**Reversible?** Yes — drop the `online` branch.

## 2026-05-09 — `ErrorState` gained an `action` prop for non-retry primary buttons
**Decision:** Extended `ErrorState` with an optional `action: { label, icon, onClick }` prop. When present, replaces the default Try-again button. Pre-existing `onRetry` callers keep working unchanged.
**Why:** Offline messaging needs a custom CTA ("Browse saved"); previous API only allowed a retry.
**Reversible?** Yes — additive.

## 2026-05-08 — Fridge: ranking=1 + ignorePantry=true on findByIngredients
**Decision:** Fridge calls Spoonacular's `/recipes/findByIngredients` with `ranking=1` (maximize used) and `ignorePantry=true`. Page size capped at 20.
**Why:** Without `ignorePantry` every recipe shows "missing salt / oil / pepper" which is noise. ranking=1 matches the design's "Most matches first" hint; ranking=2 (minimize missing) yields a similar but slightly different ordering and is harder to explain to users. 20 results is a good utility/budget trade — findByIngredients is ~1pt per result.
**Reversible?** Yes — three params on a single API wrapper.

## 2026-05-08 — Fridge results cache key is order-independent
**Decision:** `useFridgeRecipes` sorts the ingredient list before computing the session-cache key. So adding "eggs, spinach" gives the same cached results as "spinach, eggs".
**Why:** The user's perception is "I have these ingredients" — order is incidental. Sorting eliminates spurious cache misses when chips are reordered or rebuilt in a different sequence.
**Reversible?** Yes — drop the `sort()` call.

## 2026-05-08 — Fridge primary key is the lowercased ingredient name
**Decision:** Dexie `fridge` table primary key = `name` (lowercased). Re-adding "Eggs" after "eggs" is a no-op via natural dedup. Spoonacular id is stored alongside but not the key.
**Why:** Users free-type ingredients; the same ingredient typed twice with different casing should be one row. Spoonacular id is nullable since users can also add custom names not in the Spoonacular database.
**Reversible?** Yes — would need a v2 migration to swap key.

## 2026-05-08 — Session-scoped in-memory cache for search + recipe detail
**Decision:** Added `src/lib/sessionCache.ts` (module-scoped Map, no TTL). Both `useRecipeSearch` and `useRecipe` read/write it: same params/id within the browser session returns cached data, no API call. `refetch()` evicts the entry then re-fetches.
**Why:** Free tier is 150 pts/day. Without this, clicking Cook → Recipe → Cook three times burns three searches because `vercel dev` doesn't run production edge caching locally — and even in production the edge cache reduces *server cost* but the browser still does the round-trip on every navigation. The session cache eliminates the round-trip and makes Home's "Tonight's picks" feel intentional (same picks for the session). Cache lives until tab close.
**Reversible?** Yes — single primitive consumed in two hooks.

## 2026-05-08 — Preferences merge into search at the API boundary
**Decision:** SearchRoute computes `searchInputs` for `useRecipeSearch` by:
- Diet: `filters.diet ?? preferences.diet` (per-search overrides the pref default).
- Intolerances: `union(preferences.intolerances, filters.intolerances)` (always merged).
The URL stays minimal — preferences don't get written into the query string.
**Why:** Keeps the URL human-readable + shareable for the per-search overrides while still honoring the locked decision that intolerances are a hard filter. URL-encoding prefs would also create ambiguity if the user changed a pref later: do old saved URLs still apply old prefs?
**Reversible?** Yes — `searchInputs` builder is the only consumer.

## 2026-05-08 — Locked-from-prefs chips render disabled, not hidden
**Decision:** In FiltersPanel and ActiveFilterChips, intolerances coming from preferences render as `active` but `disabled`, with a tooltip. The user sees them in both surfaces, can't toggle them off, and an explicit hint connects them back to Preferences.
**Why:** Hidden = surprise filter behavior ("why are vegan recipes missing?"). Visible-but-locked makes the data flow honest and gives a path: change Preferences if you don't want the filter.
**Reversible?** Yes.

## 2026-05-08 — Preferences auto-save, no debounce on most controls
**Decision:** Each control fires `savePreferences` immediately on change. Only the calorie-target slider debounces (200ms) — sliders fire dozens of writes per drag. Diet/intolerance/units chip taps and toggles write directly.
**Why:** "Auto-saves; no Save button" is the build-prompt requirement. Debounce-everything is over-engineering when most controls are discrete clicks. The slider is the only "drag" affordance; a 200ms tail is invisible to users and saves Dexie a dozen writes per interaction.
**Reversible?** Yes — wrap every mutator in the same debounce if needed.

## 2026-05-08 — Preferences `diet` stored as single value (schema edit, no v2)
**Decision:** Edited the `PreferencesRow` shape to use `diet: string | null` instead of `diets: string[]` while still on v1 of the schema. No migration written — relying on the fact that no real users have `preferences` rows yet (the slice that wrote that table only just shipped today).
**Why:** Spoonacular's complexSearch only accepts a single `diet` value; storing an array invites the question "which one wins?" every time we read it. Single value matches the API and the search filter UI.
**Reversible?** Yes — append a v2 migration if the field needs to grow back into an array.

## 2026-05-08 — Theme picker deferred to v2 (with dark mode)
**Decision:** The Light / Dark / System picker shown in the Preferences design is not built. v1 is light-only per CLAUDE.md.
**Why:** Building the picker without a real dark theme would either ship a fake control (bad UX) or implicitly commit us to dark theme work in v1 (scope creep).
**Reversible?** N/A — the toggle lands with the dark theme in v2.

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

## 2026-05-07 — Favorites: optimistic save with background full-recipe upgrade
**Decision:** Tapping the heart inserts a Dexie row using only the `RecipeSummary` data we already have on screen, marked `complete: false`. A fire-and-forget `getRecipe(id)` then upgrades the row with full ingredients/steps/nutrition and flips `complete: true`. `useRecipe` checks the Dexie cache before the API and uses the cached row only when `complete: true`.
**Why:** Heart taps should feel instant — waiting for a network round-trip on every save is jarring. Most users will favorite from search results, where summary fields are enough for the favorites list anyway. Detail-view offline support comes online a moment later when the upgrade lands.
**Reversible?** Yes — drop the optimistic step and always fetch full data before insert. Costs a noticeable lag on save.

## 2026-05-07 — Added `dexie-react-hooks`
**Decision:** Added `dexie-react-hooks` (~3KB) for `useLiveQuery`. The FavoritesProvider and `useFavoritesList` use it to subscribe to Dexie writes and re-render automatically.
**Why:** Hand-rolling Dexie subscription via `Dexie.observable` is doable but error-prone — `useLiveQuery` is the official companion package, used everywhere with Dexie. Cross-tab updates work for free.
**Reversible?** Yes — replace each `useLiveQuery` with manual `useState` + observable subscription.

## 2026-05-07 — Dexie schema v1 declares all three tables now
**Decision:** v1 of the schema declares `favorites` (slice 5), `preferences` (slice 6), `fridge` (slice 7) up front, even though only `favorites` is wired. Versioning rule: never edit a past version — to change shape later, append a new `db.version(N).stores(...).upgrade(...)` block.
**Why:** Adding empty tables is free, but bumping schema version once shipped forces every existing user to run the upgrade hook. Declaring them all in v1 means slices 6 and 7 don't need a migration.
**Reversible?** With effort — would force a v2 to drop unused tables, more work than it's worth.

## 2026-05-07 — Favorites view-toggle + category chips deferred
**Decision:** The grid/list view toggle and dynamic category chips ("All · 23 / Quick · 8 / Vegetarian · 12") shown in the design are deferred to slice 9 / post-MVP. The route ships with grid view + search-within only.
**Why:** Both are surface-area expansions, not core to the "save and find again" job. Search-within handles ~all real lookup needs at this scale (dozens of saved recipes). The chip counts in particular need a derivation rule that works across mixed-badge recipes — non-trivial.
**Reversible?** Yes — additive changes.

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
