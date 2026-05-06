import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../Icon';
import styles from './MobileNav.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Match nested routes too (e.g. /recipe/:id should keep "Cook" highlighted). */
  end?: boolean;
}

// Lock-step with locked decision: Cook / Fridge / Saved / You.
const ITEMS: NavItem[] = [
  { to: '/', label: 'Cook', icon: 'home', end: false },
  { to: '/fridge', label: 'Fridge', icon: 'fridge' },
  { to: '/favorites', label: 'Saved', icon: 'bookmark' },
  { to: '/preferences', label: 'You', icon: 'settings' },
];

export function MobileNav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end ?? false}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon name={it.icon} size={22} strokeWidth={isActive ? 2 : 1.7} />
              <span className={styles.label}>{it.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
