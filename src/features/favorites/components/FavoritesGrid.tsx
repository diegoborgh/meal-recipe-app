import { useNavigate } from 'react-router-dom';
import { RecipeCard } from '@/components/RecipeCard';
import { useFavorites } from '@/context/FavoritesContext';
import type { FavoriteRow } from '@/db';
import styles from './FavoritesGrid.module.css';

export interface FavoritesGridProps {
  rows: FavoriteRow[];
}

/**
 * Grid of saved recipe cards. Heart click here removes (the only direction
 * that makes sense from inside the favorites screen — you can't "save" what
 * you're already viewing as saved).
 */
export function FavoritesGrid({ rows }: FavoritesGridProps) {
  const navigate = useNavigate();
  const { toggle } = useFavorites();

  return (
    <div className={styles.grid}>
      {rows.map((r) => (
        <RecipeCard
          key={r.id}
          title={r.title}
          time={r.time ?? '—'}
          {...(r.calories ? { calories: r.calories } : {})}
          {...(r.image ? { img: r.image } : {})}
          badges={r.badges}
          saved
          onClick={() => navigate(`/recipe/${r.id}`)}
          onToggleSave={() => void toggle(r)}
        />
      ))}
    </div>
  );
}
