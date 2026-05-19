import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { DietBadge } from '@/components/DietBadge';
import type { FridgeMatchResult } from '@/api/fridge';
import styles from './FridgeCard.module.css';

export interface FridgeCardProps {
  match: FridgeMatchResult;
  variant: 'row' | 'card';
}

/**
 * Compose the recipe meta line ("25 min · 420 kcal"). Either side may be
 * absent (Spoonacular sometimes omits readyInMinutes or nutrition); we drop
 * the separator gracefully and return null if both are missing.
 */
function formatMeta(time: string | null | undefined, calories: string | null | undefined): string | null {
  const parts = [time, calories].filter((p): p is string => Boolean(p));
  return parts.length ? parts.join(' · ') : null;
}

export function FridgeCard({ match, variant }: FridgeCardProps) {
  const navigate = useNavigate();
  const [imgErrored, setImgErrored] = useState(false);
  const showImg = match.image && !imgErrored;
  const meta = formatMeta(match.time, match.calories);
  const badges = match.badges ?? [];

  if (variant === 'row') {
    return (
      <div
        className={styles.row}
        role="button"
        tabIndex={0}
        onClick={() => navigate(`/recipe/${match.id}`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/recipe/${match.id}`);
          }
        }}
      >
        {showImg ? (
          <img
            src={match.image}
            alt=""
            loading="lazy"
            decoding="async"
            className={styles.thumb}
            onError={() => setImgErrored(true)}
          />
        ) : (
          <div className={styles.thumbFallback} aria-hidden="true">
            <Icon name="forks" size={24} />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.title}>{match.title}</div>
          <div className={styles.counts}>
            <span className={styles.have}>
              <Icon name="check" size={11} strokeWidth={2.8} />
              {match.usedCount} have
            </span>
            <span className={styles.need}>
              <Icon name="plus" size={11} strokeWidth={2.4} />
              {match.missedCount} need
            </span>
          </div>
          {meta && <div className={styles.meta}>{meta}</div>}
          {badges.length > 0 && (
            <div className={styles.badges}>
              {badges.map((b, i) => (
                <DietBadge key={`${b.label}-${i}`} tone={b.tone}>
                  {b.label}
                </DietBadge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop card variant
  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/recipe/${match.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/recipe/${match.id}`);
        }
      }}
    >
      <div className={styles.media}>
        {showImg ? (
          <img
            src={match.image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgErrored(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-ink-muted)',
              background: 'linear-gradient(135deg, var(--color-bg-deep), var(--color-surface-alt))',
            }}
            aria-hidden="true"
          >
            <Icon name="forks" size={32} />
          </div>
        )}
        <div className={styles.badge}>
          <Icon name="check" size={11} strokeWidth={2.8} />
          {match.usedCount} have · {match.missedCount} need
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{match.title}</div>
        {meta && <div className={styles.cardMeta}>{meta}</div>}
        {badges.length > 0 && (
          <div className={styles.badges}>
            {badges.map((b, i) => (
              <DietBadge key={`${b.label}-${i}`} tone={b.tone}>
                {b.label}
              </DietBadge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
