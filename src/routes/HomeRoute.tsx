import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { SkilletWordmark } from '@/components/SkilletWordmark';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/states';
import { useOnline } from '@/context/OnlineContext';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { HeroSearch } from '@/features/search/components/HeroSearch';
import { QuickChips } from '@/features/search/components/QuickChips';
import {
  ResultsGrid,
  ResultsSkeleton,
} from '@/features/search/components/ResultsGrid';
import { useRecipeSearch } from '@/features/search/hooks/useRecipeSearch';
import { filtersToSearchParams } from '@/features/search/filters';
import { EMPTY_FILTERS } from '@/features/search/types';
import styles from './HomeRoute.module.css';

/**
 * Home — the "Cook" tab landing. Hero + quick filters + a 6-card "Tonight's
 * picks" row. Submitting the search box navigates to /search; the chip row
 * does the same with prefilled filters.
 *
 * Tonight's picks fetches once per browser session (sessionCache hit on
 * remount with the same params). The user only sees a fresh API call when
 * they make a new search — not when they navigate Cook → Recipe → Cook.
 */
export function HomeRoute() {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const online = useOnline();

  // "Tonight's picks": light, opinionated query so the home isn't empty.
  // Same params every render → sessionCache covers re-mounts; only a hard
  // reload of the tab fetches a new set of picks.
  const { results, loading, error, quotaExceeded, refetch } = useRecipeSearch(
    { sort: 'random', number: 6 },
    true,
  );

  const goToSearch = (text: string) => {
    const sp = filtersToSearchParams({ ...EMPTY_FILTERS, query: text });
    navigate(`/search${sp.toString() ? `?${sp.toString()}` : ''}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerBar}>
        <SkilletWordmark size={20} />
        <button
          type="button"
          className={styles.headerButton}
          aria-label="Preferences"
          onClick={() => navigate('/preferences')}
        >
          <Icon name="settings" size={18} />
        </button>
      </div>

      <div className={styles.eyebrow}>{currentDayLabel()}</div>
      <h1 className={styles.hero}>
        {isDesktop ? (
          <>
            Come into the <em className={styles.heroAccent}>kitchen</em>.
          </>
        ) : (
          <>
            Come into<br />the <em className={styles.heroAccent}>kitchen</em>.
          </>
        )}
      </h1>
      <p className={styles.subhead}>
        {isDesktop ? 'What sounds good tonight?' : 'Tuesday — what are we cooking?'}
      </p>

      <div className={styles.searchRow}>
        <div className={styles.searchRowInput}>
          <HeroSearch
            value=""
            size={isDesktop ? 'lg' : 'md'}
            placeholder="Try 'quick dinner', 'salmon', 'pasta'…"
            onSubmit={(text) => goToSearch(text)}
          />
        </div>
        {isDesktop && (
          <Button
            variant="outline"
            size="lg"
            leadIcon="filter"
            onClick={() => navigate('/search')}
          >
            Filters
          </Button>
        )}
      </div>

      <div className={styles.chipsRow}>
        <QuickChips />
      </div>

      <div className={styles.sectionHead}>
        <div className={styles.sectionTitle}>Tonight’s picks</div>
        <button
          type="button"
          className={styles.sectionLink}
          onClick={() => navigate('/search')}
        >
          See all →
        </button>
      </div>

      {loading && <ResultsSkeleton count={6} />}
      {!loading && error && (
        !online ? (
          <ErrorState
            title="You're offline."
            body="Tonight's picks need a connection. Your saved recipes are always available."
            action={{
              label: 'Browse saved',
              icon: 'bookmark',
              onClick: () => navigate('/favorites'),
            }}
          />
        ) : (
          <ErrorState
            {...(quotaExceeded
              ? {
                  title: 'Caught our breath.',
                  body: 'We’ve hit today’s recipe quota. Try again later, or tap into your saved recipes.',
                }
              : {})}
            onRetry={refetch}
          />
        )
      )}
      {!loading && !error && (
        <ResultsGrid
          results={results.slice(0, 6)}
          hasMore={false}
          loadingMore={false}
          onLoadMore={() => {
            /* Home shows a fixed-size strip; no infinite scroll here. */
          }}
        />
      )}
    </div>
  );
}

/** "Tuesday · 6:42 pm"-style eyebrow. Pulls from the user's locale. */
function currentDayLabel(): string {
  const now = new Date();
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });
  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time.toLowerCase()}`;
}
