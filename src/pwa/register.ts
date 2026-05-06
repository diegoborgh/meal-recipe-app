import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker registration. vite-plugin-pwa generates the SW; this just
 * wires update prompting. We auto-update for now — the user gets the latest
 * shell on next nav. If we add an in-app "update available" UI later, swap
 * `immediate: true` for an `onNeedRefresh` callback that surfaces it.
 */
export function registerServiceWorker(): void {
  if (import.meta.env.DEV) return;
  registerSW({
    immediate: true,
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
