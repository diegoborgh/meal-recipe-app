/*
 * Install-prompt orchestration.
 *
 * Chromium-based browsers (Chrome, Edge, Brave, Samsung Internet, …) fire
 * `beforeinstallprompt` when the page meets PWA install criteria. We capture
 * the event so a UI surface can call `event.prompt()` later — calling
 * `prompt()` outside a user gesture, or before the event fires, won't work.
 *
 * Safari / iOS doesn't fire this event. The UI layer detects iOS and shows
 * "Tap Share, then Add to Home Screen" instructions instead.
 *
 * Lifecycle:
 *   - `beforeinstallprompt` → cache event, notify subscribers (state: 'available')
 *   - `appinstalled` → drop event, notify (state: 'installed')
 *   - User dismisses our prompt: event is consumable once; we clear after use.
 *
 * Usage from React: see src/hooks/usePwaInstall.ts.
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

export type InstallState = 'unavailable' | 'available' | 'installed';

let promptEvent: BeforeInstallPromptEvent | null = null;
let state: InstallState = 'unavailable';
const subscribers = new Set<(s: InstallState) => void>();

function setState(next: InstallState) {
  state = next;
  for (const cb of subscribers) cb(state);
}

export function setupInstallCapture(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Stop the default mini-infobar; we'll surface our own affordance.
    e.preventDefault();
    promptEvent = e as BeforeInstallPromptEvent;
    setState('available');
  });

  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    setState('installed');
  });

  // If the page is already running standalone (the user is in the installed
  // PWA), skip the offer entirely.
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS-only flag.
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (standalone) setState('installed');
}

export function subscribeToInstall(cb: (s: InstallState) => void): () => void {
  subscribers.add(cb);
  cb(state);
  return () => {
    subscribers.delete(cb);
  };
}

/**
 * Trigger the browser install prompt. Returns the user's choice. The event
 * is single-shot — if accepted/dismissed, we clear it. Caller should hide
 * the install button on `'accepted'`.
 */
export async function triggerInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!promptEvent) return 'unavailable';
  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;
  promptEvent = null;
  if (choice.outcome === 'accepted') {
    setState('installed');
  } else {
    // Dismissed: keep state as 'unavailable' so we don't keep nagging.
    // Browsers re-fire `beforeinstallprompt` on a future visit if criteria
    // remain met.
    setState('unavailable');
  }
  return choice.outcome;
}

/**
 * Best-effort iOS detection — used to show the "tap Share" instructions
 * since iOS doesn't fire beforeinstallprompt. UA-sniffing is unreliable
 * but adequate for an opt-in instructional surface.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPad pretends to be Mac on iPadOS 13+; check touch points to disambiguate.
  return /iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Desktop Safari on macOS Sonoma 14+ can install PWAs via File → Add to Dock.
 * There's no JS API to trigger it, so we surface manual instructions when
 * detected. UA-sniffing is unreliable but fine for an opt-in instructional
 * surface — we just want to avoid an empty card on Mac Safari.
 *
 * Excludes:
 *   - iPad-pretending-to-be-Mac (handled by isIOS)
 *   - Chromium-based browsers that ship "Safari" in their UA for compat
 *     (Chrome / Edge / Brave / Opera) — those get the native prompt path
 */
export function isDesktopSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  if (isIOS()) return false;
  const ua = navigator.userAgent;
  if (!/Macintosh/.test(ua)) return false;
  if (/Chrome|Chromium|Edg|OPR|Firefox/.test(ua)) return false;
  return /Safari\//.test(ua) && /Version\//.test(ua);
}
