# Wishlist

Polish + post-MVP items. Each entry notes where it would land + a one-liner
on why it's deferred.

## Shipped in slice 9 ✅

- **Bespoke Recipe Detail loading skeleton** — layout-shaped skeleton matching
  the eventual page (hero, stats, macros, ingredients, steps).
- **Cook Mode loading skeleton** — translucent overlays in cook-mode theme.
- **Top-level error boundary** — calm fallback with Reload + Back-to-Cook
  CTAs and expandable error details.
- **Empty-state copy audit** — replaced "Try again" with honest navigation
  labels where the action wasn't a retry.

## Locked-decision adjacent (v2)

- **Theme picker (Light / Dark / System)** — design has the chooser on the
  Preferences screen. v1 is light-only per CLAUDE.md; the picker lives in
  v2 alongside the dark theme work.

## UI / UX (deferred — pick when motivated)

- **Favorites grid/list view toggle** — design shows both in the header. Grid
  view is enough for v1; list adds re-skinned card and toggle persistence.
- **Favorites category chips** — "All · 23 / Quick · 8 / Vegetarian · 12".
  Counts derived from the saved set. Search-within covers most use cases.
- **Collapsible desktop filter sidebar** — design has it fixed at 280px;
  would give back room on smaller laptops.
- **Cook Mode optional timer card** — design shows a "Set a timer · 12 min"
  tip card under the step text. `analyzedInstructions[i].steps[i].length`
  carries duration sometimes. Display is cheap; real countdown + alarm is
  more work.
- **Sort dropdown on Search results** — design has "Sort: Best match" with
  a chevron. Filters type already carries `sort`; just needs UI.
- **Bottom-sheet swipe-to-dismiss** — currently sheets close via scrim tap
  or Esc only. iOS users will reach for the swipe.
- **iOS splash-screen PNGs** — manifest covers most platforms; iOS wants
  per-device-size PNGs for a pixel-perfect splash. Generate via the
  existing `scripts/generate-icons.mjs` pattern (sharp).
- **Surface "saved" feedback on prefs auto-save** — currently writes are
  silent. A subtle "Saved" pulse on the affected control would close the
  loop.
- **Fridge cards: time + calories on hover/long-press** — Spoonacular's
  `findByIngredients` doesn't return readyInMinutes / calories, so the
  fridge row currently shows "Need: …" instead. Option: lazy-fetch
  `recipes/{id}/information` on hover/long-press, cache via sessionCache,
  populate inline. ~1 extra API point per peek vs ~20 per search if we
  fetched all upfront.

## Post-MVP / v2

- **Calorie goal — apply automatically** — v1 stores the goal but doesn't
  use it in search. Future: surface a "fits your day" badge on cards, or
  set a default `maxCalories` filter to (target / 3) for dinner queries.
  Needs a meal-of-day signal we don't have yet.
- **JSON Import** — counterpart to the existing Export. File picker,
  validate `schema: 1`, `db.favorites.bulkPut(...)` etc. ~30 minutes.
  Real-world need: macOS Safari treats Safari and the installed PWA as
  separate IndexedDB origins, so favorites saved in one don't show up in
  the other. Import would let users move data across that boundary.
- **User-named profile + cloud sync** — bigger v2 idea. Pick a name (or
  sign in via something light — Sign in with Apple, GitHub, or our own
  magic-link). Sync favorites + preferences + fridge to a small backend
  (Vercel Postgres / Supabase / Turso). Solves the Safari-PWA storage
  split, makes the app multi-device, and gives a story for "I lost my
  laptop." Real architectural shift — would need to revisit the
  "local-first, no accounts" locked decision.
- **Vitest + smoke tests** for the API client and Dexie helpers.

## Engineering

- (none currently — error boundary shipped in slice 9)
