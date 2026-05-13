# Handoff: Collapsible Filter Sidebar (Desktop Results)

## Overview

The desktop **Search Results** page has a 280px filter sidebar on the left. Once a user has dialed in their filters, that sidebar consumes prime screen real estate they no longer need to interact with. This handoff adds a **collapse / expand affordance** so the user can reclaim that space for the recipe grid, while still seeing — and removing — their active filters.

This is a small, scoped change. It only touches the **Results** screen on **desktop** (≥1024px). Mobile filters remain a bottom-sheet modal (unchanged).

## About the design files

The files in this bundle are **design references created in HTML/React** — high-fidelity prototypes showing intended look, behavior, and state transitions. They are **not production code**. The task is to recreate this UI in the target codebase using its established patterns (React + CSS/Tailwind, Vue, etc.) and the existing component library where possible.

The interactive prototype (`screens-desktop.jsx` → `D_Results`, `FilterSidebarExpanded`, `FilterSidebarCollapsed`) uses `React.useState` and inline styles — you'll likely re-implement state via your routing/URL params or app store, and use your design tokens / Tailwind classes instead of inline pixel values.

## Fidelity

**High-fidelity.** Colors, spacing, type, and interaction states are final. Match these pixel-for-pixel using the codebase's existing libraries.

## States

### State A — Expanded (default)

```
┌─────────────────────────────┬────────────────────────────────────────────────────┐
│ Filters              Reset ⟵│  [search input……………………………] [Sort: Best match ▾] │
│                             │                                                    │
│ DIET                        │  24 recipes match your filters                     │
│ ◯Any ●Vegetarian ◯Vegan…    │                                                    │
│                             │  ┌──────┐ ┌──────┐ ┌──────┐                        │
│ AVOID                       │  │ card │ │ card │ │ card │                        │
│ ●Dairy ◯Gluten ◯Peanut…     │  └──────┘ └──────┘ └──────┘                        │
│                             │  ┌──────┐ ┌──────┐ ┌──────┐                        │
│ TIME                        │  │ card │ │ card │ │ card │                        │
│ ◯15min ●30min ◯60min ◯Any   │  └──────┘ └──────┘ └──────┘                        │
│                             │                                                    │
│ MEAL TYPE                   │                                                    │
│ ◯Brk ◯Lun ●Din ◯Snack       │                                                    │
│                             │                                                    │
│ CALORIES                    │                                                    │
│ [slider 200—600 kcal]       │                                                    │
└─────────────────────────────┴────────────────────────────────────────────────────┘
```

- Sidebar width: **280 px** fixed, padded `28 28`
- Right border: `1px solid var(--line)` (#E6DDD0)
- Header: `Filters` (display serif, 20/600) on the left; `Reset` link (accent, 12/600) + collapse button (← icon) on the right, gap 4px
- Collapse button: 28×28, transparent bg, rounded 8px, icon size 16, `aria-label="Collapse filters"`
- Filter groups in fixed vertical order: Diet · Avoid · Time · Meal type · Calories. Group label is the standard `FilterLabel` (11/700, uppercase, 1.4 letter-spacing, `inkSoft`). Chips: standard `<Chip active>` component, gap 6px, wrap.
- Results grid: **3 columns**

### State B — Collapsed (rail)

```
┌─────┬──────────────────────────────────────────────────────────────────────────┐
│ [▼] │ [search input……………………………………] [Sort: Best match ▾]                   │
│ ⊕5  │ FILTERS  [✓ Vegetarian ×] [✓ Dairy ×] [✓ Under 30 min ×] [✓ Dinner ×]   │
│     │           [✓ 200–600 kcal ×]  Edit all                                  │
│     │ 24 recipes match your filters                                            │
│ ↕   │                                                                          │
│ F   │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                                       │
│ I   │ │ card │ │ card │ │ card │ │ card │                                       │
│ L   │ └──────┘ └──────┘ └──────┘ └──────┘                                       │
│ T   │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                                       │
│ E   │ │ card │ │ card │ │ card │ │ card │                                       │
│ R   │ └──────┘ └──────┘ └──────┘ └──────┘                                       │
│ S   │                                                                          │
│ ·5  │                                                                          │
└─────┴──────────────────────────────────────────────────────────────────────────┘
```

- Rail width: **64 px** fixed
- Right border: `1px solid var(--line)`
- Top: a **44×44 round button** centered (filter icon, 18px), background `surface` (#FFFEFA), border `1px line`. `aria-label="Expand filters"`.
- **Count badge** on that button: top-right offset (`top -4, right -4`), min 18×18 pill, accent background (#C0502B), white 10/700 tabular-num text, 2px border in `bg` color to lift it off the button.
- Below the button: vertical "FILTERS · 5" label, `writing-mode: vertical-rl; transform: rotate(180deg);`, 10/700 uppercase, letter-spacing 1.6, `inkSoft`. Reads bottom-to-top.
- Active filters surface as a **chip row in the main content**, above the recipe count:
  - Small `FILTERS` label (11/700 uppercase) prefix
  - Each filter as a removable `<Chip active onRemove>`
  - Trailing `Edit all` text button (accent, 12/600) — opens the sidebar back to expanded
- Results grid: **4 columns** (widens to use the reclaimed space)

## Interactions & behavior

| Action | Result |
|---|---|
| Click ← in expanded header | Collapse to rail; chips move to content area; grid widens to 4 cols |
| Click filter button on rail | Expand back to 280px; chip row disappears; grid returns to 3 cols |
| Click × on a chip (either state) | Remove that filter, recount results, update badge count |
| Click "Reset" in expanded header | Clear all filters, badge → 0 (rail hides badge when count = 0) |
| Click "Edit all" in collapsed chip row | Expand sidebar |

### Animation
- `width` transitions: **200ms ease**. Chips fade in/out in the content area at the same duration.
- Grid column count change is instant — don't animate `grid-template-columns`; it's expensive and flickers cards.
- No layout shift on the recipe cards themselves; they re-flow into the new column count naturally.

### Persistence
- Collapsed state should be remembered between sessions. Suggested: `localStorage['filters_collapsed'] = true/false`, hydrate on mount. Don't fail noisy if storage is unavailable.

## Responsive

- **≥ 1024px (lg)**: this pattern is in effect
- **640–1023px**: sidebar is hidden; filters open as a bottom sheet (existing mobile pattern)
- **< 640px**: same as above — bottom sheet

If the viewport crosses the lg breakpoint while collapsed, keep the collapsed-rail state. If it drops below 1024 → fall back to the modal pattern (state is preserved for when they cross back up).

## State management

```ts
type FilterState = {
  collapsed: boolean;          // sidebar UI state (this PR)
  diet: Diet;                  // single-select
  avoid: Set<Intolerance>;     // multi-select
  maxTime: 15 | 30 | 60 | null;
  mealType: MealType | null;
  caloriesMin: number;
  caloriesMax: number;
};

// Derived
const activeFilters: ActiveFilter[] = useMemo(() => […], [filterState]);
const activeCount = activeFilters.length;
```

`activeFilters` is the array used by **both**:
- the badge count on the rail
- the chip row above results when collapsed

So removing a chip and `setFilter(...)` both write to the same source of truth.

## Design tokens (subset used here)

```
--accent:   #C0502B   // primary, badge bg, "Reset"/"Edit all" links
--ink:      #2A1F17
--inkSoft:  #6B5A4A   // group labels, "FILTERS" prefix
--bg:       #F6F1E8   // badge border ring (so it lifts off the button)
--surface:  #FFFEFA   // rail filter button bg
--line:     #E6DDD0   // sidebar right border, button border

--font-display: 'Fraunces', Georgia, serif    // "Filters" header
--font-body:    'Inter', system-ui, sans-serif

--radius-pill:  9999px      // chips, count badge
--radius-md:    8px         // collapse button
--radius-lg:    12px        // (cards, not used directly here)

--sidebar-w-expanded:  280px
--sidebar-w-collapsed:  64px
--filter-button:        44px    // rail filter button
--filter-icon:          18px
```

## Accessibility

- Both toggle buttons have `aria-label`s ("Collapse filters" / "Expand filters") and `aria-expanded` set on the rail/sidebar wrapper.
- The count badge should not be the only signal — pair with the "FILTERS · N" text label, which we do.
- Keyboard: collapse/expand button is tab-reachable; `Enter` and `Space` activate.
- When collapsing, **don't move focus** to the rail button automatically (avoids surprising the user). When expanding via the rail button, focus stays on it.
- Active-filter chips on the chip-row should be keyboard-removable: focus the chip, then `Delete` or `Backspace` triggers `onRemove`, OR the chip's × is tab-reachable on its own.

## Components touched

| Component | Change |
|---|---|
| `D_Results` (Results page) | Adds `expanded` state, conditionally renders sidebar variants, conditionally renders chip row, swaps grid column count |
| `FilterSidebarExpanded` | New component — extracted from the previous inline sidebar; adds the collapse button |
| `FilterSidebarCollapsed` | New component — 64px rail with filter button + count badge + vertical label |
| `Chip` | No change — already supports `active` + `onRemove` |
| `Icon` | Uses existing `filter` and `arrowL` glyphs |

## Files in this bundle

- `screens-desktop.jsx` — contains `D_Results`, `FilterSidebarExpanded`, `FilterSidebarCollapsed` (the reference implementation)
- `components.jsx` — `<Chip>`, `<Icon>`, `<SearchInput>`, `<Button>` (used inside the screen; same components you should map to your design system)
- `tokens.jsx` — color / type / radius tokens used above
- `BEFORE-AFTER.md` — short visual summary of the change

## Out of scope

- The mobile filter sheet (unchanged)
- Filter logic itself (this PR is UI-only; underlying state shape is already in place)
- Sort menu (the "Sort: Best match" button)
- The "Reset" confirmation behavior (assume immediate; no modal)
