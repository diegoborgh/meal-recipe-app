import { Icon } from '@/components/Icon';
import { useFavorites } from '@/context/FavoritesContext';
import styles from './UndoToast.module.css';

/**
 * Mounted once at the layout level. Listens for the FavoritesContext's
 * `pendingRemoval` slot — when it's non-null, render a toast offering Undo.
 *
 * The 5-second auto-dismiss timer lives in the provider; this component just
 * reflects state and exposes the two affordances.
 */
export function UndoToast() {
  const { pendingRemoval, restore, clearPendingRemoval } = useFavorites();
  if (!pendingRemoval) return null;

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.label}>
        Removed “{pendingRemoval.title}”
      </span>
      <button
        type="button"
        className={styles.undoBtn}
        onClick={() => void restore(pendingRemoval)}
      >
        Undo
      </button>
      <button
        type="button"
        className={styles.dismiss}
        aria-label="Dismiss"
        onClick={clearPendingRemoval}
      >
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
