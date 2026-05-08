import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import styles from './FavoritesEmpty.module.css';

/**
 * Empty state for /favorites. Two flavors:
 *   - First-time: no saved recipes ever. Show the full pitch + CTA.
 *   - Search miss: have favorites, but the search-within filter has zero hits.
 */
export interface FavoritesEmptyProps {
  variant: 'first-time' | 'search-miss';
  query?: string;
}

export function FavoritesEmpty({ variant, query }: FavoritesEmptyProps) {
  if (variant === 'search-miss') {
    return (
      <div className={styles.frame}>
        <div className={styles.bubble}>
          <Icon name="search" size={40} strokeWidth={1.4} color="var(--color-accent)" />
        </div>
        <h2 className={styles.title}>
          No matches for{' '}
          <em className={styles.titleAccent}>“{query}”</em>
          .
        </h2>
        <p className={styles.body}>
          Try a different word, or clear the search to see everything you've
          saved.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <div className={styles.bubble}>
        <Icon name="heart" size={48} strokeWidth={1.4} color="var(--color-accent)" />
      </div>
      <h2 className={styles.title}>
        A blank page,
        <br />
        waiting to be <em className={styles.titleAccent}>filled</em>.
      </h2>
      <p className={styles.body}>
        Tap the heart on any recipe you want to come back to. Saved recipes
        work offline — perfect for the kitchen.
      </p>
      <Link to="/search">
        <Button variant="primary" leadIcon="search" style={{ marginTop: 4 }}>
          Find something to cook
        </Button>
      </Link>
    </div>
  );
}
