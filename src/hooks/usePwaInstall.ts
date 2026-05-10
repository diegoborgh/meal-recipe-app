import { useEffect, useState } from 'react';
import {
  isDesktopSafari,
  isIOS,
  subscribeToInstall,
  triggerInstall,
  type InstallState,
} from '@/pwa/install';

export interface UsePwaInstall {
  state: InstallState;
  /** True when the platform is iOS — caller shows Share-sheet instructions. */
  ios: boolean;
  /** True when the platform is desktop Safari on macOS — caller shows
   *  File-menu instructions. */
  desktopSafari: boolean;
  /** Trigger the install prompt. No-op when state !== 'available'. */
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
}

/**
 * React surface for the PWA install state. Subscribes to the singleton
 * capture in src/pwa/install.ts so multiple consumers stay in sync.
 */
export function usePwaInstall(): UsePwaInstall {
  const [state, setState] = useState<InstallState>('unavailable');

  useEffect(() => {
    return subscribeToInstall(setState);
  }, []);

  return {
    state,
    ios: isIOS(),
    desktopSafari: isDesktopSafari(),
    install: triggerInstall,
  };
}
