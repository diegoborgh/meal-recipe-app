# Before / After — Collapsible filter sidebar

## Before

- Filter sidebar is always 280px wide.
- Recipe grid is always 3 columns wide.
- Active filters can only be seen / removed by scrolling the sidebar.

## After

| | Expanded (default) | Collapsed (rail) |
|---|---|---|
| Sidebar width | 280 px | 64 px |
| Recipe grid columns | 3 | 4 |
| Active filters visible | inside sidebar chip lists | as a chip row above results |
| Toggle affordance | `←` button next to "Reset" | filter icon button on the rail |

### What didn't change
- Mobile screens (filter sheet is still a bottom-sheet modal)
- Filter categories, options, or behavior
- Visual identity (colors, type, radii)

### Why
Reclaiming the sidebar space gives a 4-column grid that shows ~33% more recipes per fold. Users who've already filtered rarely revisit the sidebar — surfacing only the active filters keeps the affordance accessible without the cost.
