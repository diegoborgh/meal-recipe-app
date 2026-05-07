# Wishlist

Things to revisit during slice 9 (polish pass) or post-MVP. Each entry should
note where it would land + a one-liner on why it's deferred.

## UI / UX

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

## Engineering

- **Vitest + a smoke test** for the API client and Dexie helpers. Add when the
  first IndexedDB bug shows up.
