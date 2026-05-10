/*
 * Service worker registration + update orchestration.
 *
 * Behavior:
 *   - In dev (Vite dev server) we no-op. SW churn during HMR is more pain
 *     than it's worth.
 *   - In production we register the SW, then watch for new versions. When
 *     a new SW finishes installing, we push to a tiny in-module pub/sub
 *     so the React tree can render an "Update available" banner. The user
 *     decides when to refresh — we don't auto-reload from under them.
 *
 * Why prompt instead of auto-update: an auto-update can swap your SW
 * mid-task (e.g. while the user is in Cook Mode reading a step) and the
 * NEXT navigation gets a different bundle. That's confusing. Better to
 * surface the choice and let the user pick the moment.
 */

import { registerSW } from 'virtual:pwa-register';

type UpdateCallback = (ready: boolean) => void;

let needRefresh = false;
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;
const subscribers = new Set<UpdateCallback>();

function notify() {
  for (const cb of subscribers) cb(needRefresh);
}

export function subscribeToPwaUpdate(cb: UpdateCallback): () => void {
  subscribers.add(cb);
  // Sync the new subscriber with current state.
  cb(needRefresh);
  return () => {
    subscribers.delete(cb);
  };
}

/** Apply the pending update and reload. No-op when nothing's pending. */
export async function applyPwaUpdate(): Promise<void> {
  if (!needRefresh || !updateSW) return;
  await updateSW(true); // reloadPage = true
}

export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      needRefresh = true;
      notify();
    },
    onOfflineReady() {
      // First install — app is now usable offline. We don't surface this
      // as a toast; the OfflineBanner handles the "you went offline" state.
      // eslint-disable-next-line no-console
      console.info('[PWA] Ready to work offline.');
    },
    onRegisteredSW(swUrl) {
      // eslint-disable-next-line no-console
      console.info('[PWA] Service worker registered:', swUrl);
    },
    onRegisterError(err) {
      // eslint-disable-next-line no-console
      console.warn('[PWA] Service worker registration failed:', err);
    },
  });
}
