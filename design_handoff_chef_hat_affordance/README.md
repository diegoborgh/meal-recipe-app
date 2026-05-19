# Handoff: Chef-hat icon for the "You" affordance

## Overview

Replace the **settings gear** glyph with a **chef-hat profile glyph** in two places on the mobile UI:

1. **Bottom-nav "You" tab** — the gear icon currently rendering there reads as a sun in low-contrast contexts and was being misread as a light/dark mode toggle.
2. **Home-screen header (upper-right)** — the same gear icon used to live in this corner; remove it leaves a visible dead zone. Put the chef-hat there instead so the affordance to enter "your kitchen" (preferences, profile, saved data) is visible from the home screen too.

Both buttons route to the **same destination** (the Preferences screen) — the chef-hat is purely a label change, not a routing change.

## About the design files

The files in this bundle are **design references in React/HTML** — high-fidelity mock-ups showing the intended look and metric, not production code to drop in. Re-implement using your codebase's existing icon system (e.g. lucide-react, an SVG sprite, a custom component) and existing button primitives. Pull the exact SVG path from `Icon` in `components.jsx` if you don't already have an equivalent glyph.

## Fidelity

**High-fidelity.** Colors, sizes, hit-target dimensions, and the SVG glyph itself are final.

## The glyph

A chef's toque (two-curve hat over a 5-px band), drawn on a 24×24 viewBox at 1.8 stroke weight, stroke-only, `currentColor`.

```svg
<svg width="24" height="24" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="1.8"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 14a4 4 0 0 1 0-8 4 4 0 0 1 7-1 4 4 0 0 1 4 9"/>
  <path d="M7 14h11v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/>
</svg>
```

Use the same icon at multiple sizes (18/22/24) — it scales cleanly because there are no closed shapes, only paths.

## Change 1 — Bottom-nav "You" tab

### Before
- Icon glyph: `settings` (8-spoke gear)
- Label: "You"
- Hit target: 100% of tab width × 60 px tall

### After
- Icon glyph: `chef` (toque, SVG above)
- Label: "You" *(unchanged)*
- Hit target: *unchanged*
- Active state: stroke + label color = `--accent` (#C0502B); stroke-weight: `2` (active) / `1.7` (inactive)
- Icon size: **22 × 22**

### Why
The gear at 22×22 with a soft `inkSoft` (#6B5A4A) stroke reads visually as a sunburst — especially next to the "Saved" bookmark and the rounded "Cook" home glyph. A toque is unmistakably about people / preferences / "your kitchen," which is exactly what the tab does, and it stays on-brand for a cooking app.

## Change 2 — Home header upper-right

### Before (post-removal)
- The header had a 40×40 round button with the same gear icon, removed during responsive work because of the same sun-confusion problem
- The space is now empty, leaving the header visually unbalanced

### After
- Restore the **40×40 round icon button** in that slot
- Icon glyph: `chef` at 18 × 18
- Stroke color: `--inkSoft` (#6B5A4A)
- Button bg: `--surface` (#FFFEFA)
- Button border: `1px solid --line` (#E6DDD0)
- Border radius: 999 (full circle)
- `aria-label="You — your kitchen"`
- On tap → navigate to Preferences (same route as bottom-nav "You" tab)

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [skillet wordmark]                                  [👨‍🍳]│  ← 40×40 button
│                                                             │
│  Come into                                                  │
│  the kitchen.                                               │
│  Tuesday — what are we cooking?                             │
│                                                             │
│  [search input………………………………………………]                       │
│  [15 min] [Vegetarian] [Quick dinner] [High-protein] →     │
└─────────────────────────────────────────────────────────────┘
```

- Header row: `display: flex; justify-content: space-between; align-items: center` — wordmark left, chef-hat button right
- Vertical margin from button to next element: 22 px (existing spacing)

## Interactions

| Trigger | Result |
|---|---|
| Tap chef-hat (header) | Navigate to `/preferences` |
| Tap "You" tab (bottom nav) | Navigate to `/preferences` |
| Active tab `"settings"` | Chef-hat stroke + label render in `--accent` |
| Hover (desktop, if mirrored) | Optional 50ms ease background tint `rgba(0,0,0,0.04)` |

Both buttons share routing — implementing this is just *icon name swap* + *adding the header button*.

## Files touched

| File | Change |
|---|---|
| `components.jsx` → `MobileNav` items array | `icon: 'settings'` → `icon: 'chef'` for the `settings` tab |
| `components.jsx` → `Icon` paths | Confirm the `chef` glyph exists (it's already in this bundle's `Icon` component) |
| `screens-mobile-1.jsx` → `M_Home` header | Add back the 40×40 round button with `chef` icon |

## Accessibility

- Both buttons must have an `aria-label`. The bottom-nav tab can rely on its visible "You" text; the header button needs `aria-label="You — your kitchen"` (or your equivalent).
- Hit target: 40×40 minimum (header button); the nav tab is full-width so it's already compliant.
- Stroke contrast: `inkSoft` (#6B5A4A) on `surface` (#FFFEFA) passes WCAG AA for non-text icons.

## Out of scope

- Icon swaps anywhere else in the app
- Any change to the Preferences screen itself
- Desktop sidebar (no change — desktop already uses a clearly-labeled "Preferences" link)

## Files in this bundle

- `README.md` — this spec
- `components.jsx` — has the canonical `chef` SVG path inside the `Icon` component and the corrected `MobileNav`
- `screens-mobile-1.jsx` — has the updated `M_Home` with the chef-hat header button
- `tokens.jsx` — color values referenced above
