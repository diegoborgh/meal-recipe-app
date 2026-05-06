import { Outlet } from 'react-router-dom';
import { MobileNav } from '@/components/MobileNav';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { OfflineBanner } from '@/components/states';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import styles from './RootLayout.module.css';

/**
 * Top-level layout. One responsive app — not two parallel implementations.
 * Below 1024px → bottom tab bar. ≥1024px → persistent left sidebar.
 *
 * The Cook Mode route bypasses this layout entirely (see CookModeLayout).
 */
export function RootLayout() {
  const isDesktop = useIsDesktop();

  return (
    <div className={`${styles.shell} ${isDesktop ? styles.shellWithSidebar : ''}`}>
      {isDesktop && <DesktopSidebar />}

      <div className={styles.main}>
        <OfflineBanner />
        <div
          className={`${styles.content} ${
            isDesktop ? styles.contentDesktop : styles.contentMobile
          }`}
        >
          <Outlet />
        </div>
        {!isDesktop && <MobileNav />}
      </div>
    </div>
  );
}
