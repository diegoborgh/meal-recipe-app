import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import styles from './InstallPrompt.module.css';

/**
 * Install prompt UI for the Preferences screen.
 *
 * Three states:
 *   - Chromium with install criteria met → "Install Skillet" button that
 *     fires the native browser prompt.
 *   - iOS Safari (no beforeinstallprompt) → manual instructions for Add to
 *     Home Screen.
 *   - Already installed (running standalone) → small confirmation, no CTA.
 *   - Anything else → render nothing (no install path available).
 */
export function InstallPrompt() {
  const { state, ios, install } = usePwaInstall();

  if (state === 'installed') {
    return (
      <div className={styles.card}>
        <div className={styles.icon}>
          <Icon name="check" size={20} strokeWidth={2.5} />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>Installed</div>
          <div className={styles.installed}>
            Skillet is on your device.
          </div>
        </div>
      </div>
    );
  }

  if (state === 'available') {
    return (
      <div className={styles.card}>
        <div className={styles.icon}>
          <Icon name="upload" size={20} />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>Install Skillet</div>
          <div className={styles.hint}>
            Adds it to your home screen and lets favorites work offline.
          </div>
        </div>
        <Button variant="primary" onClick={() => void install()}>
          Install
        </Button>
      </div>
    );
  }

  // No native prompt fired. iOS gets manual instructions; everywhere else
  // (desktop Firefox, etc.) we hide entirely — there's no path to surface.
  if (ios) {
    return (
      <div className={styles.card}>
        <div className={styles.icon}>
          <Icon name="upload" size={20} />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>Add Skillet to your Home Screen</div>
          <ol className={styles.iosSteps}>
            <li>Tap the Share button in Safari.</li>
            <li>Choose <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong>.</li>
          </ol>
        </div>
      </div>
    );
  }

  return null;
}
