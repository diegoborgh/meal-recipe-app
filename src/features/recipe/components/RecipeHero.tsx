import { useState } from 'react';
import { Icon } from '@/components/Icon';
import styles from './RecipeHero.module.css';

export interface RecipeHeroProps {
  /** Spoonacular CDN image URL or undefined. Falls back to a neutral gradient. */
  image?: string | undefined;
  /** Title for image alt text — kept terse, not the full recipe title. */
  alt?: string;
  saved: boolean;
  onToggleSave: () => void;
  onBack: () => void;
  /** Mobile = full-bleed, desktop = rounded card. */
  variant: 'mobile' | 'desktop';
}

/**
 * Hero image for the recipe detail page. Two visual variants share the same
 * controls — back button (mobile only) and save button.
 */
export function RecipeHero({
  image,
  alt = '',
  saved,
  onToggleSave,
  onBack,
  variant,
}: RecipeHeroProps) {
  const [errored, setErrored] = useState(false);
  const showImage = image && !errored;

  return (
    <div className={variant === 'mobile' ? styles.heroMobile : styles.heroDesktop}>
      {showImage ? (
        <img
          src={image}
          alt={alt}
          className={styles.image}
          loading="eager"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className={styles.imageFallback} aria-hidden="true">
          <Icon name="forks" size={48} />
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.controlsTop}>
          {variant === 'mobile' && (
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Back"
              onClick={onBack}
            >
              <Icon name="arrowL" size={18} />
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved' : 'Save recipe'}
            onClick={onToggleSave}
          >
            <Icon
              name={saved ? 'heart-fill' : 'heart'}
              size={variant === 'desktop' ? 20 : 18}
              color={saved ? 'var(--color-accent)' : 'var(--color-ink)'}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
