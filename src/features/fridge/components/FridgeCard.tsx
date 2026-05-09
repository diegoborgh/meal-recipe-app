import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import type { FridgeMatchResult } from '@/api/fridge';
import styles from './FridgeCard.module.css';

export interface FridgeCardProps {
  match: FridgeMatchResult;
  variant: 'row' | 'card';
}

/**
 * Pretty list of missing ingredients. Up to 3 names; truncates with "…and 2
 * more" when longer. Hidden when nothing's missing.
 */
function formatMissing(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length <= 3) return `Need: ${names.join(', ')}`;
  const head = names.slice(0, 3).join(', ');
  return `Need: ${head}, and ${names.length - 3} more`;
}

export function FridgeCard({ match, variant }: FridgeCardProps) {
  const navigate = useNavigate();
  const [imgErrored, setImgErrored] = useState(false);
  const showImg = match.image && !imgErrored;
  const missing = formatMissing(match.missedNames);

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
          {missing && <div className={styles.missing}>{missing}</div>}
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
        {missing && <div className={styles.cardMissing}>{missing}</div>}
      </div>
    </div>
  );
}
