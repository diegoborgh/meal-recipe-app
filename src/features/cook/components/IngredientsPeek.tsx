import { useEffect, useRef } from 'react';
import { Icon } from '@/components/Icon';
import type { Units } from '@/context/PreferencesContext';
import { IngredientsList } from '@/features/recipe/components/IngredientsList';
import type { Recipe } from '@/types/recipe';
import styles from './IngredientsPeek.module.css';

export interface IngredientsPeekProps {
  open: boolean;
  recipe: Recipe;
  servings: number;
  units: Units;
  onClose: () => void;
}

/**
 * Slide-in ingredients panel for Cook Mode. Mobile = bottom sheet, desktop =
 * right-side drawer. Reuses the slice-3 IngredientsList so amounts/units
 * stay in sync with whatever the user set on the Recipe Detail screen.
 *
 * Esc closes; click on the scrim closes; click inside doesn't.
 */
export function IngredientsPeek({
  open,
  recipe,
  servings,
  units,
  onClose,
}: IngredientsPeekProps) {
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };
    // Capture so this beats the global step navigation Esc handler.
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open, onClose]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        ref={scrimRef}
        className={styles.scrim}
        onClick={(e) => {
          if (e.target === scrimRef.current) onClose();
        }}
      />
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Ingredients"
      >
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <div className={styles.title}>Ingredients</div>
          <button
            type="button"
            className={styles.close}
            aria-label="Close ingredients"
            onClick={onClose}
          >
            <Icon name="close" size={18} color="#fff" />
          </button>
        </div>
        <div className={styles.body}>
          <IngredientsList
            ingredients={recipe.ingredients}
            originalServings={recipe.servings}
            servings={servings}
            units={units}
          />
        </div>
      </div>
    </>
  );
}
