import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/states';
import { useOnline } from '@/context/OnlineContext';
import { usePreferences } from '@/context/PreferencesContext';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { HeroSearch } from '@/features/search/components/HeroSearch';
import { ActiveFilterChips } from '@/features/search/components/ActiveFilterChips';
import { FiltersPanel } from '@/features/search/components/FiltersPanel';
import { FiltersSheet } from '@/features/search/components/FiltersSheet';
import {
  ResultsGrid,
  ResultsSkeleton,
} from '@/features/search/components/ResultsGrid';
import { NoResults } from '@/features/search/components/NoResults';
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  filtersReducer,
} from '@/features/search/filters';
import {
  DIETS,
  INTOLERANCES,
  activeFilterCount,
  type Diet,
  type Filters,
  type Intolerance,
} from '@/features/search/types';
import { CollapsedFiltersBar } from '@/features/search/components/CollapsedFiltersBar';
import { useRecipeSearch } from '@/features/search/hooks/useRecipeSearch';
import type { SearchParams } from '@/api/search';
import styles from './SearchRoute.module.css';

/**
 * Search results screen.
 *
 * Filter state strategy: the URL is the source of truth. `filters` is derived
 * from `searchParams` on every render, and a "dispatch" closure projects each
 * action through the reducer and writes the resulting URL back. That means:
 *   - Back/forward navigates filter history naturally
 *   - Deep links work
 *   - No stale local state to reconcile
 *
 * The mobile FiltersSheet edits a *draft* internally and only commits via
 * onApply — so chip toggles inside the sheet don't fire searches per click.
 */
export function SearchRoute() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Default: sidebar expanded. Per Diego's feedback (2026-05-12) we don't
  // persist this — every page entry starts expanded, the user can collapse
  // during the session, and a refresh resets back to expanded.
  const [desktopFiltersCollapsed, setDesktopFiltersCollapsed] = useState(false);
  const { preferences } = usePreferences();
  const online = useOnline();

  const filters: Filters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: Filters) => setSearchParams(filtersToSearchParams(next), { replace: true }),
    [setSearchParams],
  );

  const dispatch = useCallback(
    (action: Parameters<typeof filtersReducer>[1]) => {
      setFilters(filtersReducer(filters, action));
    },
    [filters, setFilters],
  );

  /*
   * Locked decision: intolerances from preferences are *always* applied —
   * never overridden by the filter UI. Diet from preferences is a default
   * — used when the per-search filters.diet is null. Both unions/fallbacks
   * happen here at the API boundary so the URL stays minimal (we don't
   * want to URL-encode preference state).
   *
   * Narrow the prefs values to our type unions before merging — preferences
   * are stored as plain string but only DIETS / INTOLERANCES values are valid.
   */
  const lockedDiet: Diet | null = useMemo(() => {
    const v = preferences.diet;
    return v && (DIETS as readonly string[]).includes(v) ? (v as Diet) : null;
  }, [preferences.diet]);

  const lockedIntolerances: Intolerance[] = useMemo(
    () =>
      preferences.intolerances.filter((i): i is Intolerance =>
        (INTOLERANCES as readonly string[]).includes(i),
      ),
    [preferences.intolerances],
  );

  // Translate Filters → SearchParams (the API client's shape).
  const searchInputs: SearchParams = useMemo(() => {
    const out: SearchParams = { sort: filters.sort };
    if (filters.query.trim()) out.query = filters.query.trim();

    // Diet: per-search wins, prefs as fallback default.
    const effectiveDiet = filters.diet ?? lockedDiet;
    if (effectiveDiet) out.diet = effectiveDiet;

    // Intolerances: union of locked-from-prefs + per-search additions.
    const intolerances = Array.from(
      new Set<string>([...lockedIntolerances, ...filters.intolerances]),
    );
    if (intolerances.length > 0) out.intolerances = intolerances;

    if (filters.type) out.type = filters.type;
    if (filters.maxReadyTime != null) out.maxReadyTime = filters.maxReadyTime;
    if (filters.minCalories != null) out.minCalories = filters.minCalories;
    if (filters.maxCalories != null) out.maxCalories = filters.maxCalories;
    return out;
  }, [filters, lockedDiet, lockedIntolerances]);

  // Don't fire a search when there's literally nothing to search by.
  // Locked-from-prefs values count — a user with intolerances set has an
  // implicit search input even without typing anything.
  const hasAnyInput = useMemo(() => {
    if (filters.query.trim()) return true;
    if (filters.diet || lockedDiet) return true;
    if (filters.intolerances.length > 0 || lockedIntolerances.length > 0) return true;
    if (filters.type) return true;
    if (filters.maxReadyTime != null) return true;
    if (filters.minCalories != null || filters.maxCalories != null) return true;
    return false;
  }, [filters, lockedDiet, lockedIntolerances]);

  const search = useRecipeSearch(searchInputs, hasAnyInput);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <Icon name="arrowL" size={18} />
          </button>
          <div className={styles.searchInputWrap}>
            <HeroSearch
              value={filters.query}
              onSubmit={(text) =>
                dispatch({ type: 'set_query', query: text })
              }
            />
          </div>
        </div>
        {/*
         * Per the collapsible-sidebar design: on desktop, filter readout lives
         * either inside the (expanded) sidebar or inline above the results
         * grid (when collapsed) — not in the page header. Mobile/tablet keep
         * the header chips as the path into the bottom-sheet editor.
         */}
        {!isDesktop && (
          <ActiveFilterChips
            filters={filters}
            dispatch={dispatch}
            lockedDiet={lockedDiet}
            lockedIntolerances={lockedIntolerances}
            onOpenFilters={() => setSheetOpen((v) => !v)}
          />
        )}
      </div>

      <div
        className={`${styles.body} ${isDesktop ? styles.bodyDesktop : styles.bodyMobile}`}
      >
        {isDesktop && (
          <aside
            className={`${styles.sidebar} ${
              desktopFiltersCollapsed ? styles.sidebarCollapsedRail : ''
            }`}
            aria-label="Filters"
          >
            {desktopFiltersCollapsed ? (
              <div className={styles.rail}>
                <button
                  type="button"
                  className={styles.railButton}
                  aria-label="Expand filters"
                  aria-expanded={false}
                  title="Expand filters"
                  onClick={() => setDesktopFiltersCollapsed(false)}
                >
                  <Icon name="filter" size={18} />
                  {activeFilterCount(filters) > 0 && (
                    <span className={styles.railBadge}>
                      {activeFilterCount(filters)}
                    </span>
                  )}
                </button>
                <span className={styles.railLabel}>
                  Filters · {activeFilterCount(filters)}
                </span>
              </div>
            ) : (
              <>
                <div className={styles.sidebarHead}>
                  <div className={styles.sidebarTitle}>Filters</div>
                  <div className={styles.sidebarHeadActions}>
                    <button
                      type="button"
                      className={styles.reset}
                      onClick={() => dispatch({ type: 'reset' })}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className={styles.sidebarCollapse}
                      aria-label="Collapse filters"
                      aria-expanded={true}
                      title="Collapse filters"
                      onClick={() => setDesktopFiltersCollapsed(true)}
                    >
                      <Icon name="arrowL" size={16} />
                    </button>
                  </div>
                </div>
                <FiltersPanel
                  filters={filters}
                  dispatch={dispatch}
                  lockedDiet={lockedDiet}
                  lockedIntolerances={lockedIntolerances}
                />
              </>
            )}
          </aside>
        )}

        <div className={styles.results}>
          {/* Active-filter readout — desktop, collapsed-sidebar only. */}
          {isDesktop && desktopFiltersCollapsed && (
            <div className={styles.collapsedBarSlot}>
              <CollapsedFiltersBar
                filters={filters}
                dispatch={dispatch}
                lockedDiet={lockedDiet}
                lockedIntolerances={lockedIntolerances}
                onEditAll={() => setDesktopFiltersCollapsed(false)}
              />
            </div>
          )}

          {!hasAnyInput && (
            <ErrorState
              title="What sounds good?"
              body="Search by recipe name, ingredient, or jump in with a chip from Home."
              action={{
                label: 'Browse picks',
                icon: 'home',
                onClick: () => navigate('/'),
              }}
            />
          )}

          {hasAnyInput && search.loading && search.results.length === 0 && (
            <>
              <div className={styles.resultsMeta}>Searching…</div>
              <ResultsSkeleton count={6} wide={isDesktop && desktopFiltersCollapsed} />
            </>
          )}

          {hasAnyInput && search.error && search.results.length === 0 && (
            !online ? (
              <ErrorState
                title="You're offline."
                body="Search needs a connection. Your saved recipes work without one."
                action={{
                  label: 'Browse saved',
                  icon: 'bookmark',
                  onClick: () => navigate('/favorites'),
                }}
              />
            ) : (
              <ErrorState
                {...(search.quotaExceeded
                  ? {
                      title: 'Caught our breath.',
                      body: 'We’ve hit today’s recipe quota. Try again later, or tap into your saved recipes.',
                    }
                  : {})}
                onRetry={search.refetch}
              />
            )
          )}

          {hasAnyInput &&
            !search.loading &&
            !search.error &&
            search.results.length === 0 && (
              <NoResults filters={filters} dispatch={dispatch} />
            )}

          {hasAnyInput && search.results.length > 0 && (
            <>
              <div className={styles.resultsMeta}>
                <span className={styles.resultsMetaCount}>
                  {search.totalResults.toLocaleString()} recipes
                </span>{' '}
                match your filters
              </div>
              <ResultsGrid
                results={search.results}
                hasMore={search.hasMore}
                loadingMore={search.loadingMore}
                onLoadMore={search.loadMore}
                wide={isDesktop && desktopFiltersCollapsed}
              />
            </>
          )}
        </div>
      </div>

      {!isDesktop && (
        <>
          <FiltersSheet
            open={sheetOpen}
            filters={filters}
            lockedDiet={lockedDiet}
            lockedIntolerances={lockedIntolerances}
            totalResults={search.totalResults}
            onApply={(next) => {
              setFilters(next);
              setSheetOpen(false);
            }}
            onClose={() => setSheetOpen(false)}
          />
          {/*
           * Floating Filters CTA on mobile. Always visible — toggles the
           * sheet open/closed. When open, the same button acts as the close
           * affordance (lifted above the sheet via .filtersCtaOpen).
           */}
          <div
            className={`${styles.filtersCta} ${
              sheetOpen ? styles.filtersCtaOpen : ''
            }`}
          >
            <Button
              variant="dark"
              leadIcon={sheetOpen ? 'close' : 'filter'}
              onClick={() => setSheetOpen((v) => !v)}
            >
              {sheetOpen ? 'Close' : 'Filters'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
