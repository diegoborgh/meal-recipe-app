import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import styles from './InstallPrompt.module.css';

/**
 * Install prompt UI for the Preferences screen.
 *
 * States:
 *   - Already installed (running standalone) → small confirmation, no CTA.
 *   - Chromium with install criteria met → "Install Skillet" button that
 *     fires the native browser prompt.
 *   - iOS Safari → manual Share-sheet instructions (no beforeinstallprompt).
 *   - Desktop Safari (macOS Sonoma 14+) → manual File-menu instructions
 *     (also no beforeinstallprompt, no JS API to trigger).
 *   - Anything else (desktop Firefox, etc.) → render nothing (no install path).
 */
export function InstallPrompt() {
  const { state, ios, desktopSafari, install } = usePwaInstall();

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

  // No native prompt fired. Two manual paths: iOS Share sheet, macOS
  // Safari File menu. Otherwise render nothing — no install affordance.
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

  if (desktopSafari) {
    return (
      <div className={styles.card}>
        <div className={styles.icon}>
          <Icon name="upload" size={20} />
        </div>
        <div className={styles.body}>
          <div className={styles.title}>Add Skillet to your Dock</div>
          <ol className={styles.iosSteps}>
            <li>
              Open the <strong>File</strong> menu in Safari.
            </li>
            <li>
              Choose <strong>Add to Dock…</strong>
            </li>
            <li>
              Click <strong>Add</strong>.
            </li>
          </ol>
          <div className={styles.hint} style={{ marginTop: 6 }}>
            Requires macOS Sonoma (14) or later.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
