import type { CSSProperties } from 'react';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import styles from './RecipeDetailSkeleton.module.css';

/** Single shimmer block. Size + radius are inline-styled per usage. */
function Block({ style }: { style: CSSProperties }) {
  return <div className={styles.skel} style={style} aria-hidden="true" />;
}

/**
 * Layout-shaped skeleton for RecipeRoute. Renders mobile or desktop variant
 * based on the breakpoint hook so the cold paint matches the eventual
 * layout, not a generic spinner.
 *
 * Counts (4 ingredient rows, 3 step rows) are arbitrary but average — most
 * recipes land in that range and the eventual content fills out without a
 * dramatic layout shift.
 */
export function RecipeDetailSkeleton() {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <div role="status" aria-label="Loading recipe">
        {/* Back link placeholder */}
        <Block style={{ width: 120, height: 14, marginBottom: 18 }} />

        <div className={styles.desktopGrid}>
          <div className={styles.desktopLeft}>
            <Block style={{ width: '100%' }} />
            {/* Hero override — aspect-ratio + radius */}
            <div className={styles.desktopHero}>
              <Block style={{ width: '100%', height: '100%', borderRadius: 0 }} />
            </div>

            {/* "Ingredients" header */}
            <div className={styles.row} style={{ justifyContent: 'space-between' }}>
              <Block style={{ width: 140, height: 22 }} />
              <Block style={{ width: 180, height: 32, borderRadius: 999 }} />
            </div>

            <div className={styles.ingredientList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.ingredientRow}>
                  <Block style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
                  <Block style={{ flex: 1, height: 14 }} />
                  <Block style={{ width: 60, height: 12 }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.desktopRight}>
            <Block style={{ width: '40%', height: 14 }} />
            <Block style={{ width: '90%', height: 36 }} />
            <Block style={{ width: '60%', height: 36 }} />

            <div className={styles.statsStrip}>
              <Block style={{ height: 32 }} />
              <Block style={{ height: 32 }} />
              <Block style={{ height: 32 }} />
            </div>

            <div className={styles.macroRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.macroPill}>
                  <Block style={{ width: '40%', height: 10 }} />
                  <Block style={{ width: '60%', height: 18 }} />
                  <Block style={{ width: '100%', height: 3 }} />
                </div>
              ))}
            </div>

            <Block style={{ width: 160, height: 22, marginTop: 4 }} />
            <div className={styles.steps}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.step}>
                  <div className={styles.stepNumber}>
                    <Block style={{ width: '100%', height: '100%', borderRadius: 999 }} />
                  </div>
                  <div className={styles.stepBody}>
                    <Block style={{ width: '100%', height: 12 }} />
                    <Block style={{ width: '85%', height: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile ────────────────────────────────────────────────────────────
  return (
    <div className={styles.mobileShell} role="status" aria-label="Loading recipe">
      <div className={styles.mobileHero}>
        <Block style={{ width: '100%', height: '100%', borderRadius: 0 }} />
      </div>
      <div className={styles.mobileSheet}>
        {/* Badge row */}
        <div className={styles.row}>
          <Block style={{ width: 70, height: 18, borderRadius: 999 }} />
          <Block style={{ width: 50, height: 18, borderRadius: 999 }} />
        </div>
        {/* Title */}
        <Block style={{ width: '90%', height: 26 }} />
        <Block style={{ width: '60%', height: 26 }} />
        {/* Attribution */}
        <Block style={{ width: 140, height: 12 }} />

        <div className={styles.statsStrip}>
          <Block style={{ height: 32 }} />
          <Block style={{ height: 32 }} />
          <Block style={{ height: 32 }} />
        </div>

        <div className={styles.macroRow}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.macroPill}>
              <Block style={{ width: '40%', height: 10 }} />
              <Block style={{ width: '60%', height: 18 }} />
              <Block style={{ width: '100%', height: 3 }} />
            </div>
          ))}
        </div>

        <div className={styles.row} style={{ justifyContent: 'space-between' }}>
          <Block style={{ width: 110, height: 18 }} />
          <Block style={{ width: 96, height: 32, borderRadius: 999 }} />
        </div>

        <div className={styles.ingredientList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.ingredientRow}>
              <Block style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0 }} />
              <Block style={{ flex: 1, height: 14 }} />
              <Block style={{ width: 60, height: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
