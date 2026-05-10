import { useState } from 'react';
import { Icon } from '@/components/Icon';
import { usePwaUpdate } from '@/hooks/usePwaUpdate';
import styles from './UpdateBanner.module.css';

/**
 * Slim banner shown when a newer service worker has installed and is waiting.
 * Mounted at RootLayout. The user decides when to refresh — auto-update would
 * risk swapping the bundle mid-task (e.g. while reading a Cook Mode step).
 *
 * Dismiss is local-only (just hides the banner for this session). On the
 * next page load the new SW will already be in control, so the banner won't
 * re-appear — no persistence needed.
 */
export function UpdateBanner() {
  const { ready, apply } = usePwaUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!ready || dismissed) return null;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.body}>
        <Icon name="sparkle" size={14} />
        <span className={styles.label}>A fresher version of Skillet is ready.</span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.btn} ${styles.dismiss}`}
          onClick={() => setDismissed(true)}
        >
          Later
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.refresh}`}
          onClick={() => void apply()}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
