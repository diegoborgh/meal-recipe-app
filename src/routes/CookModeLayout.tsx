import { Outlet } from 'react-router-dom';
import styles from './CookModeLayout.module.css';

/**
 * Cook Mode B layout — the protected anchor. Drops nav chrome entirely and
 * scopes the dark cream / honey theme via the global `.cook-mode` class.
 * Wake Lock + step navigation live in the route component, not the layout.
 */
export function CookModeLayout() {
  return (
    <div className={`${styles.shell} cook-mode`}>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
