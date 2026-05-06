import { useMediaQuery } from './useMediaQuery';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Single source of truth for the responsive layout switch.
 * Locked decision — see CLAUDE.md:
 *   <768px       → mobile  (bottom tab bar, single-col)
 *   768–1023px   → tablet  (bottom tab bar, 2-col grids)
 *   ≥1024px      → desktop (left sidebar, multi-col grids)
 */
export function useBreakpoint(): Breakpoint {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023.98px)');
  if (isDesktop) return 'desktop';
  if (isTablet) return 'tablet';
  return 'mobile';
}

/** Shortcut for layout chrome decisions (sidebar vs bottom nav). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
