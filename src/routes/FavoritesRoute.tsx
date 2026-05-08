import { useState } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { useFavorites } from '@/context/FavoritesContext';
import { FavoritesEmpty } from '@/features/favorites/components/FavoritesEmpty';
import { FavoritesGrid } from '@/features/favorites/components/FavoritesGrid';
import { useFavoritesList } from '@/features/favorites/hooks/useFavoritesList';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import styles from './FavoritesRoute.module.css';

/**
 * "Your cookbook" — the saved recipes screen.
 *
 * Mobile and desktop differ in chrome (compact title + below-search vs large
 * title + side-by-side search), but the data is the same: a Dexie-backed live
 * list filterable by a single search-within string.
 *
 * Three rendered states:
 *   - First-time empty (no favorites at all): big pitch + Search CTA.
 *   - Search miss (have favorites, none match query): smaller no-match panel.
 *   - Populated grid.
 *
 * View-toggle (grid/list) and category chips from the design are deferred to
 * slice 9 — search-within is enough for v1 and saves a chunk of complexity
 * (esp. the chip counts, which are derived from the saved set).
 */
export function FavoritesRoute() {
  const isDesktop = useIsDesktop();
  const [query, setQuery] = useState('');
  const filtered = useFavoritesList(query);
  const { ids } = useFavorites();

  const totalCount = ids.size;
  const hasAnyFavorites = totalCount > 0;
  const hasResults = (filtered?.length ?? 0) > 0;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>
              Your <em className={styles.titleAccent}>cookbook</em>
            </h1>
            {hasAnyFavorites && (
              <div className={styles.subtitle}>
                {totalCount} saved {totalCount === 1 ? 'recipe' : 'recipes'} ·
                always available offline
              </div>
            )}
          </div>
          {hasAnyFavorites && (
            <div className={styles.searchRow}>
              <SearchInput
                size={isDesktop ? 'md' : 'sm'}
                value={query}
                onChange={setQuery}
                placeholder={
                  isDesktop ? 'Search saved…' : 'Search your saved recipes…'
                }
              />
            </div>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {!hasAnyFavorites ? (
          <FavoritesEmpty variant="first-time" />
        ) : !hasResults ? (
          <FavoritesEmpty variant="search-miss" query={query} />
        ) : (
          <FavoritesGrid rows={filtered ?? []} />
        )}
      </div>
    </div>
  );
}
