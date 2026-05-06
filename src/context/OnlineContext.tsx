import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const OnlineContext = createContext<boolean>(true);

/**
 * Tracks navigator.onLine. Subscribes to online/offline events.
 * Note: navigator.onLine is best-effort — a true network reachability check
 * would require an actual probe. For our offline UX (showing the banner +
 * gating API calls), best-effort is enough.
 */
export function OnlineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return <OnlineContext.Provider value={online}>{children}</OnlineContext.Provider>;
}

export function useOnline(): boolean {
  return useContext(OnlineContext);
}
