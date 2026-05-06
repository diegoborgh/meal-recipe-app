import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../Icon';
import { SkilletWordmark } from '../SkilletWordmark';
import styles from './DesktopSidebar.module.css';

interface SidebarItem {
  to: string;
  label: string;
  icon: IconName;
}

// Design has 3 main items + Preferences in the footer.
const PRIMARY: SidebarItem[] = [
  { to: '/', label: 'Cook', icon: 'home' },
  { to: '/fridge', label: 'My fridge', icon: 'fridge' },
  { to: '/favorites', label: 'Saved', icon: 'bookmark' },
];

export function DesktopSidebar() {
  return (
    <aside className={styles.sidebar} aria-label="Primary">
      <div className={styles.brand}>
        <SkilletWordmark size={22} />
      </div>

      {PRIMARY.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.itemActive : ''}`}
        >
          <span className={styles.itemIcon}>
            <Icon name={it.icon} size={20} />
          </span>
          <span>{it.label}</span>
        </NavLink>
      ))}

      <div className={styles.footer}>
        <div className={styles.divider} />
        <NavLink
          to="/preferences"
          className={({ isActive }) =>
            `${styles.footerItem} ${isActive ? styles.footerItemActive : ''}`
          }
        >
          <Icon name="settings" size={18} />
          <span>Preferences</span>
        </NavLink>
      </div>
    </aside>
  );
}
