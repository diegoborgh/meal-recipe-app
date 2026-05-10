import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../Button';
import { Icon } from '../Icon';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Top-level error boundary. Wraps the entire app inside `main.tsx`. Catches
 * any thrown render error or thrown effect that React surfaces during a
 * commit — including the Dexie/useLiveQuery rethrow class of bug that took
 * down the slice-7 deploy until we shipped a hotfix.
 *
 * Fallback UI: calm card, primary "Reload" CTA, expandable error details for
 * the developer (collapsed by default, present in production so users can
 * paste it into a bug report).
 *
 * NOT caught here:
 *   - Async errors (those are handled per-call inside hooks via `error` state)
 *   - Errors thrown in event handlers (also caller-handled)
 *   - SSR errors (we don't SSR)
 *
 * Class component because React 18 still doesn't expose a hooks-based error
 * boundary. The official guidance is to use a class for the boundary itself
 * even in a hooks-first codebase.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log to console for the developer; in production this gets picked up by
    // Vercel's runtime logs if anyone's looking. No external error tracker
    // wired up — that's a v2 decision.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught:', error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  reload = (): void => {
    window.location.reload();
  };

  goHome = (): void => {
    // Hard navigation — clears any corrupt in-memory state alongside the
    // boundary reset.
    window.location.assign('/');
  };

  render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className={styles.frame} role="alert">
        <div className={styles.card}>
          <div className={styles.bubble}>
            <Icon name="info" size={26} />
          </div>
          <div className={styles.title}>Something burned in the pan.</div>
          <div className={styles.body}>
            Skillet hit an unexpected error. A reload usually fixes it. If it
            keeps happening, your saved recipes are safe — they're stored on
            this device.
          </div>
          <div className={styles.actions}>
            <Button variant="primary" leadIcon="undo" onClick={this.reload}>
              Reload
            </Button>
            <Button variant="outline" leadIcon="home" onClick={this.goHome}>
              Back to Cook
            </Button>
          </div>
          <details className={styles.details}>
            <summary>Show details</summary>
            <pre>{error.stack ?? error.message}</pre>
          </details>
        </div>
      </div>
    );
  }
}
