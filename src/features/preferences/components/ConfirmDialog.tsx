import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/Button';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** When true, confirm button gets the "danger" treatment. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Lightweight modal confirm. Built specifically for the "Clear my data"
 * destructive action — the only place we currently need a hard confirm.
 *
 * Esc cancels; click on the scrim cancels; focus traps to the dialog while
 * open (basic — first interactive element gets focus).
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const scrimRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={scrimRef}
      className={styles.scrim}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === scrimRef.current) onCancel();
      }}
    >
      <div className={styles.dialog}>
        <div className={styles.title}>{title}</div>
        {body && <div className={styles.body}>{body}</div>}
        <div className={styles.actions}>
          <Button ref={cancelRef} variant="outline" full onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'dark' : 'primary'}
            full
            onClick={onConfirm}
            style={
              danger
                ? { background: 'var(--color-danger)', color: '#fff' }
                : undefined
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
