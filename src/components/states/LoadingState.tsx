import type { CSSProperties } from 'react';
import styles from './states.module.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
}

/** A single skeleton block. Compose to build feature-specific loading states. */
export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  return (
    <div
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

/** Generic spinner-free loading frame. Most loading should use Skeleton instead. */
export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.frame} role="status" aria-live="polite">
      <Skeleton width={64} height={64} radius={999} />
      <span className="t-caption">{label}</span>
    </div>
  );
}
