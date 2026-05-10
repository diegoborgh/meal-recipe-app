import type { CSSProperties } from 'react';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import styles from './CookSkeleton.module.css';

function Block({ style }: { style: CSSProperties }) {
  return <div className={styles.skel} style={style} aria-hidden="true" />;
}

/**
 * Cook Mode loading skeleton — shaped like CookStep so the cold paint
 * matches the eventual layout. Uses translucent white overlays under the
 * .cook-mode token scope (CookModeLayout's class).
 */
export function CookSkeleton() {
  const isDesktop = useIsDesktop();
  const numberSize: CSSProperties = isDesktop
    ? { width: 220, height: 200 }
    : { width: 120, height: 64 };

  return (
    <div className={styles.frame} role="status" aria-label="Loading recipe">
      <div className={styles.numberWrap}>
        <Block style={numberSize} />
      </div>
      <div className={styles.body}>
        <Block style={{ width: '95%', height: 28 }} />
        <Block style={{ width: '88%', height: 28 }} />
        <Block style={{ width: '70%', height: 28 }} />
      </div>
    </div>
  );
}
