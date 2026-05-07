import { Icon } from '@/components/Icon';
import { CookProgress } from './CookProgress';
import styles from './CookTopBar.module.css';

export interface CookTopBarProps {
  count: number;
  index: number;
  onExit: () => void;
  onToggleIngredients: () => void;
  onJump?: (i: number) => void;
  /** Desktop renders the ingredients button as a labeled pill; mobile is icon-only. */
  isDesktop: boolean;
}

export function CookTopBar({
  count,
  index,
  onExit,
  onToggleIngredients,
  onJump,
  isDesktop,
}: CookTopBarProps) {
  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.iconBtn}
        aria-label="Exit Cook Mode"
        onClick={onExit}
      >
        <Icon name="close" size={20} color="#fff" />
      </button>

      <CookProgress count={count} index={index} {...(onJump ? { onJump } : {})} />

      {isDesktop ? (
        <button
          type="button"
          className={styles.ingredientsBtn}
          onClick={onToggleIngredients}
        >
          <Icon name="forks" size={16} color="#fff" />
          Ingredients
        </button>
      ) : (
        <button
          type="button"
          className={styles.ingredientsBtnIcon}
          aria-label="Show ingredients"
          onClick={onToggleIngredients}
        >
          <Icon name="forks" size={20} color="#fff" />
        </button>
      )}
    </div>
  );
}
