# Wishlist

Things to revisit during slice 9 (polish pass) or post-MVP. Each entry should
note where it would land + a one-liner on why it's deferred.

## Locked-decision adjacent (v2)

- **Theme picker (Light / Dark / System)** — design has the chooser on the
  Preferences screen. v1 is light-only per CLAUDE.md; the picker lives in
  v2 alongside the dark theme work.

## UI / UX

- **Favorites grid/list view toggle** — design shows both in the header. Grid
  view is enough for v1; list adds re-skinned card and toggle persistence.
  Slice 9.
- **Favorites category chips** — "All · 23 / Quick · 8 / Vegetarian · 12".
  Counts are derived from the saved set (groupBy badge or readyInMinutes).
  Search-within covers most use cases for now. Slice 9 / post-MVP.
- **Collapsible desktop filter sidebar** — design has it fixed at 280px; would
  give back ~280px on smaller laptops. Slice 9.
- **Cook Mode optional timer card** — design shows a "Set a timer · 12 min" tip
  card under the step text. Real Spoonacular `analyzedInstructions[i].steps[i]
  .length` carries duration sometimes. Adding the *display* is cheap; adding
  real countdown + alarm is post-MVP.
- **Bespoke Recipe Detail loading skeleton** — currently the global LoadingState
  shows. A hero-shaped + ingredient-rows-shaped skeleton would feel less janky.
  Slice 9.
- **Sort dropdown on Search results** — design has "Sort: Best match" with a
  chevron. Filters type already carries `sort`; just needs UI. Slice 9 / post.
- **Bottom-sheet swipe-to-dismiss** — currently sheets close via scrim tap or
  Esc only. iOS users will reach for the swipe. Slice 9.
- **iOS splash-screen PNGs** — manifest covers most platforms; iOS wants
  per-device-size PNGs (10+ sizes) for a pixel-perfect splash. Currently
  iOS falls back to the manifest background + icon, which works but isn't
  identity-perfect. Generate via the existing `scripts/generate-icons.mjs`
  pattern (sharp). Slice 9.
- **Calorie goal — apply automatically** — v1 stores the goal but doesn't
  use it in search. Future: surface a "fits your day" badge on cards, or
  set a default `maxCalories` filter to (target / 3) for dinner queries.
  Post-MVP — needs a meal-of-day signal we don't have yet.
- **Surface "saved" feedback on prefs auto-save** — currently writes are
  silent. A subtle "Saved" pulse on the affected control would close the
  loop. Slice 9.
- **Fridge cards: time + calories on hover/long-press** — Spoonacular's
  `findByIngredients` doesn't return readyInMinutes / calories, so the
  fridge row currently shows "Need: …" instead. Option: lazy-fetch
  `recipes/{id}/information` on hover (desktop) or long-press (mobile),
  cache via sessionCache, populate the row inline. ~1 extra API point per
  peek vs ~20 per search if we fetched all upfront. Worth evaluating —
  may not be necessary if the rows feel useful as-is.

## Engineering

- **Top-level error boundary** — a single Dexie/render error currently blanks
  the whole tree (e.g., the slice-7 `orderBy` on a non-indexed field crashed
  the app via useLiveQuery rethrow). Adding a boundary with a "Reload" CTA
  would degrade gracefully and is the right slice-9 polish.
- **Vitest + a smoke test** for the API client and Dexie helpers. Add when the
  first IndexedDB bug shows up. (Update: it did, slice 7.)
