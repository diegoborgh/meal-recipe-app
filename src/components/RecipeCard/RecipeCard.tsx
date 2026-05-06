import { useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { Icon } from '../Icon';
import { DietBadge, type DietBadgeTone } from '../DietBadge';
import styles from './RecipeCard.module.css';

export interface RecipeCardBadge {
  label: string;
  tone?: DietBadgeTone;
}

export interface RecipeCardProps {
  title: string;
  /** Display string e.g. "30 min". Pre-formatted by the caller. */
  time: string;
  /** Optional calorie display string e.g. "420 cal". Hidden if absent. */
  calories?: string;
  /** Spoonacular CDN URL. Falls back to a neutral placeholder on error. */
  img?: string;
  badges?: RecipeCardBadge[];
  saved?: boolean;
  /** When set, shown as a badge in the bottom-left. e.g. "5 of 6 ingredients". */
  fridgeMatch?: string;
  onClick?: () => void;
  onToggleSave?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function RecipeCard({
  title,
  time,
  calories,
  img,
  badges = [],
  saved,
  fridgeMatch,
  onClick,
  onToggleSave,
  className,
  style,
}: RecipeCardProps) {
  const [imgErrored, setImgErrored] = useState(false);

  const handleSaveClick = (e: MouseEvent) => {
    e.stopPropagation();
    onToggleSave?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`${styles.card} ${className ?? ''}`}
      style={style}
    >
      <div className={styles.media}>
        {img && !imgErrored ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            decoding="async"
            className={styles.image}
            onError={() => setImgErrored(true)}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            <Icon name="forks" size={32} />
          </div>
        )}

        <button
          type="button"
          aria-label={saved ? 'Remove from saved' : 'Save recipe'}
          aria-pressed={saved}
          className={styles.saveButton}
          onClick={handleSaveClick}
        >
          <Icon
            name={saved ? 'heart-fill' : 'heart'}
            size={18}
            color={saved ? 'var(--color-accent)' : 'var(--color-ink)'}
          />
        </button>

        {fridgeMatch && (
          <div className={styles.fridgeMatch}>
            <Icon name="check" size={11} strokeWidth={2.5} /> {fridgeMatch}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Icon name="clock" size={13} /> {time}
          </span>
          {calories && (
            <span className={styles.metaItem}>
              <Icon name="flame" size={13} /> {calories}
            </span>
          )}
        </div>
        {badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((b, i) => (
              <DietBadge key={`${b.label}-${i}`} tone={b.tone ?? 'olive'}>
                {b.label}
              </DietBadge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
