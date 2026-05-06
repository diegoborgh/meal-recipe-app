import { useOnline } from '@/context/OnlineContext';
import { Icon } from '../Icon';
import styles from './states.module.css';

/**
 * Slim banner shown when the device is offline. Hides itself when back online.
 * Mounted once at the layout level so every screen gets it for free.
 */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className={styles.offlineBanner} role="status">
      <Icon name="wifiOff" size={14} />
      <span>You’re offline. Showing saved recipes only.</span>
    </div>
  );
}
