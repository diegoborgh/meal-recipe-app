# Wishlist

Polish + post-MVP items. Each entry notes a one-liner on what it is and
why it was deferred from the MVP. Pick freely — these are all optional;
the MVP is shipped.

---

## 🎯 Next-session priority — mobile responsive UX

Diego flagged on 2026-05-10 that several mobile responsive issues need
attention. Open the deployed app at <https://meal-recipe-app-steel.vercel.app>
on a phone (or DevTools device mode), walk every route, and capture concrete
issues with screenshots before grinding through them. Likely suspects to
check first:

- Touch-target sizes on the filter sheet + recipe-detail controls
- Bottom-sheet behavior around the iOS bottom safe area
- Tap-targets vs. scroll regions on the Fridge chip input
- Sticky header behavior on Search results
- Cook Mode font scaling on narrow screens

(Add specific findings here as Diego runs the audit; once the list is
concrete, prioritize within this section.)

---

## Polish — do any time, in any order

Each ~30 min – 2 hr. Pick when motivated.

- **Favorites grid/list view toggle** — design shows both in the header.
  Grid is enough for v1; list adds a re-skinned card + toggle persistence.
- **Favorites category chips** — "All · 23 / Quick · 8 / Vegetarian · 12".
  Counts derived from the saved set. Search-within covers most use cases
  today, but chips improve scannability with more saves.
- **Collapsible desktop filter sidebar** — design has it fixed at 280px;
  would give back room on smaller laptops.
- **Sort dropdown on Search results** — design has "Sort: Best match"
  with a chevron. The Filters type already carries `sort`; just needs UI.
- **Bottom-sheet swipe-to-dismiss** — sheets currently close via scrim
  tap or Esc only. iOS users reach for the swipe.
- **iOS splash-screen PNGs** — manifest covers most platforms; iOS wants
  per-device-size PNGs for a pixel-perfect splash. Generate via the
  existing `scripts/generate-icons.mjs` pattern (sharp).
- **"Saved" pulse on Preferences auto-save** — currently writes are
  silent. A subtle pulse on the affected control would close the loop.
- **Cook Mode optional timer card** — design shows a "Set a timer · 12 min"
  tip card under the step text. `analyzedInstructions[i].steps[i].length`
  carries duration sometimes. Display-only is cheap; real countdown +
  alarm is more work.
- **Fridge cards: time + calories on hover/long-press** — Spoonacular's
  `findByIngredients` omits readyInMinutes / calories. Option: lazy-fetch
  `recipes/{id}/information` on hover/long-press, cache via sessionCache,
  populate inline. ~1 extra API point per peek vs. ~20 per search if we
  fetched all upfront.
- **JSON Import** — counterpart to the existing Export. File picker,
  validate `schema: 1`, `db.favorites.bulkPut(...)`. ~30 minutes. Real
  use: macOS Safari treats Safari and the installed PWA as separate
  IndexedDB origins, so favorites saved in one don't show up in the
  other. Import lets users move data across that boundary.

## v2 — bigger swings

These re-open locked decisions or add real infrastructure. Plan
intentionally, not on a whim.

- **Dark theme + theme picker (Light / Dark / System)** — design has the
  chooser on Preferences. CLAUDE.md locks light-only for v1. Build the
  dark theme tokens, then wire the picker. The Cook Mode theme override
  already proves the token-scope pattern works; reuse it.
- **Calorie goal — apply automatically** — v1 stores the goal but doesn't
  use it in search. Future: surface a "fits your day" badge on cards, or
  set a default `maxCalories` filter for dinner queries. Needs a
  meal-of-day signal we don't have yet.
- **User-named profile + cloud sync** — pick a name (or sign in via Sign
  in with Apple / GitHub / magic-link). Sync favorites + preferences +
  fridge to a small backend (Supabase / Turso / Convex / etc.). Solves
  the Safari ↔ installed-PWA storage split, makes the app multi-device,
  and gives a story for "I lost my laptop." Real architectural shift —
  would re-open the "local-first, no accounts" locked decision in
  CLAUDE.md.
- **Vitest + smoke tests** for the API client and Dexie helpers. The
  slice-7 IndexedDB bug would've been caught by a smoke test; we
  punted then with "add when the first one shows up." It showed up.

---

## Reference — already shipped

For context when reading older decisions or auditing what's done:

- **Slice 9 (2026-05-10):** RecipeDetailSkeleton, CookSkeleton, top-level
  ErrorBoundary, empty-state copy audit.
- **Slice 8 (2026-05-09):** PWA install + update prompt, manifest
  shortcuts, offline-aware messaging on Search / Fridge / Recipe / Home.
  Desktop Safari install hint added on 2026-05-10.
- **Slices 1–7:** scaffold, search, recipe detail, Cook Mode B,
  favorites + Dexie, preferences, fridge.

See [`docs/decisions.md`](docs/decisions.md) for the full chronological log.
