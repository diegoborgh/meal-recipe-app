import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/states';
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
import { type Filters } from '@/features/search/types';
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

  // Translate Filters → SearchParams (the API client's shape).
  const searchInputs: SearchParams = useMemo(() => {
    const out: SearchParams = { sort: filters.sort };
    if (filters.query.trim()) out.query = filters.query.trim();
    if (filters.diet) out.diet = filters.diet;
    if (filters.intolerances.length > 0) out.intolerances = filters.intolerances;
    if (filters.type) out.type = filters.type;
    if (filters.maxReadyTime != null) out.maxReadyTime = filters.maxReadyTime;
    if (filters.minCalories != null) out.minCalories = filters.minCalories;
    if (filters.maxCalories != null) out.maxCalories = filters.maxCalories;
    return out;
  }, [filters]);

  // Don't fire a search when there's literally nothing to search by.
  const hasAnyInput = useMemo(() => {
    if (filters.query.trim()) return true;
    if (filters.diet) return true;
    if (filters.intolerances.length > 0) return true;
    if (filters.type) return true;
    if (filters.maxReadyTime != null) return true;
    if (filters.minCalories != null || filters.maxCalories != null) return true;
    return false;
  }, [filters]);

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
        <ActiveFilterChips
          filters={filters}
          dispatch={dispatch}
          onOpenFilters={() => (isDesktop ? null : setSheetOpen(true))}
        />
      </div>

      <div
        className={`${styles.body} ${isDesktop ? styles.bodyDesktop : styles.bodyMobile}`}
      >
        {isDesktop && (
          <aside className={styles.sidebar} aria-label="Filters">
            <div className={styles.sidebarHead}>
              <div className={styles.sidebarTitle}>Filters</div>
              <button
                type="button"
                className={styles.reset}
                onClick={() => dispatch({ type: 'reset' })}
              >
                Reset
              </button>
            </div>
            <FiltersPanel filters={filters} dispatch={dispatch} />
          </aside>
        )}

        <div className={styles.results}>
          {!hasAnyInput && (
            <ErrorState
              title="What sounds good?"
              body="Search by recipe name, ingredient, or jump in with a chip from Home."
              onRetry={() => navigate('/')}
            />
          )}

          {hasAnyInput && search.loading && search.results.length === 0 && (
            <>
              <div className={styles.resultsMeta}>Searching…</div>
              <ResultsSkeleton count={6} />
            </>
          )}

          {hasAnyInput && search.error && search.results.length === 0 && (
            <ErrorState
              {...(search.quotaExceeded
                ? {
                    title: 'Caught our breath.',
                    body: 'We’ve hit today’s recipe quota. Try again later, or tap into your saved recipes.',
                  }
                : {})}
              onRetry={search.refetch}
            />
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
            totalResults={search.totalResults}
            onApply={(next) => {
              setFilters(next);
              setSheetOpen(false);
            }}
            onClose={() => setSheetOpen(false)}
          />
          {/* Floating Filters CTA on mobile — keeps the chip in the header
              from being the only entry point. */}
          {!sheetOpen && (
            <div
              style={{
                position: 'fixed',
                right: 16,
                bottom: `calc(var(--mobile-nav-h) + var(--safe-bottom) + 12px)`,
                zIndex: 3,
              }}
            >
              <Button
                variant="dark"
                leadIcon="filter"
                onClick={() => setSheetOpen(true)}
              >
                Filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
