import { useEffect, useState } from 'react';
import { applyPwaUpdate, subscribeToPwaUpdate } from '@/pwa/register';

export interface UsePwaUpdate {
  /** True when a newer service worker is installed and ready to take over. */
  ready: boolean;
  /** Apply the update and reload the page. No-op when not ready. */
  apply: () => Promise<void>;
}

export function usePwaUpdate(): UsePwaUpdate {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeToPwaUpdate(setReady);
  }, []);

  return { ready, apply: applyPwaUpdate };
}
