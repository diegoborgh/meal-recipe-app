/**
 * useWakeLock — keep the screen on for the lifetime of this hook.
 *
 * Behavior:
 *   - Requests a 'screen' wake lock on mount.
 *   - Re-acquires when the page returns to visibility (the OS releases wake
 *     locks while the tab is hidden; without this, leaving and returning
 *     would silently drop the lock).
 *   - Releases on unmount.
 *   - Fails silently when the API isn't available (Safari before 16.4, some
 *     desktop Linux). Cook Mode is still usable — the screen just dims as
 *     normal.
 *
 * The Wake Lock API is fragile by design: any user dismissal also drops the
 * lock and `navigator.wakeLock.request()` can reject for a dozen reasons.
 * Treat all errors as soft failures.
 */

import { useEffect, useRef } from 'react';

interface WakeLockSentinelLike {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
}

interface NavigatorWithWakeLock {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
}

export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active) return undefined;
    const nav = navigator as unknown as NavigatorWithWakeLock;
    if (!nav.wakeLock) return undefined; // unsupported — bail quietly

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        if (cancelled) {
          // We unmounted between the request and the resolution.
          void sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        // Some browsers fire 'release' when the system drops it.
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch {
        // Permission denied, page hidden, battery saver, etc. Soft-fail.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && sentinelRef.current === null) {
        void acquire();
      }
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const s = sentinelRef.current;
      sentinelRef.current = null;
      if (s && !s.released) {
        void s.release().catch(() => {});
      }
    };
  }, [active]);
}
