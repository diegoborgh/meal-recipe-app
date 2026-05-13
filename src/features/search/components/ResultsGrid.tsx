import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '@/components/RecipeCard';
import { Skeleton } from '@/components/states';
import { useFavorites } from '@/context/FavoritesContext';
import { useIntersection } from '@/hooks/useIntersection';
import type { RecipeSummary } from '@/types/recipe';
import styles from './ResultsGrid.module.css';

export interface ResultsGridProps {
  results: RecipeSummary[];
  hasMore: boolean;
  loadingMore: boolean;
  /** Fired when the sentinel is scrolled near the bottom of the viewport. */
  onLoadMore: () => void;
  /** Desktop-only: widen the grid to 4 columns (used when the filter sidebar is collapsed). */
  wide?: boolean;
}

/** Fixed-count card skeleton shown on the first page load. */
export function ResultsSkeleton({ count = 6, wide = false }: { count?: number; wide?: boolean }) {
  return (
    <div className={`${styles.skeletonGrid} ${wide ? styles.wide : ''}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.cardSkeleton}>
          <div className={styles.cardSkeletonImage} />
          <div className={styles.cardSkeletonBody}>
            <Skeleton height={18} width="80%" />
            <Skeleton height={12} width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResultsGrid({ results, hasMore, loadingMore, onLoadMore, wide = false }: ResultsGridProps) {
  const navigate = useNavigate();
  const { isSaved, toggle } = useFavorites();
  const [sentinelRef, isVisible] = useIntersection<HTMLDivElement>({ rootMargin: '300px' });

  useEffect(() => {
    if (isVisible && hasMore && !loadingMore) onLoadMore();
  }, [isVisible, hasMore, loadingMore, onLoadMore]);

  return (
    <>
      <div className={`${styles.grid} ${wide ? styles.wide : ''}`}>
        {results.map((r) => (
          <RecipeCard
            key={r.id}
            title={r.title}
            time={r.time ?? '—'}
            {...(r.calories ? { calories: r.calories } : {})}
            {...(r.image ? { img: r.image } : {})}
            badges={r.badges}
            saved={isSaved(r.id)}
            onClick={() => navigate(`/recipe/${r.id}`)}
            onToggleSave={() => void toggle(r)}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className={styles.sentinel}>
          {loadingMore ? 'Loading more…' : ''}
        </div>
      )}
    </>
  );
}
