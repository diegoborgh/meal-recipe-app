import { useEffect, useReducer, useRef, type Dispatch } from 'react';
import { Button } from '@/components/Button';
import { filtersReducer, type FilterAction } from '../filters';
import type { Filters } from '../types';
import { FiltersPanel } from './FiltersPanel';
import styles from './FiltersSheet.module.css';

export interface FiltersSheetProps {
  open: boolean;
  /** The committed (URL-backed) filters. The sheet operates on a draft copy. */
  filters: Filters;
  totalResults: number;
  onApply: (next: Filters) => void;
  onClose: () => void;
}

/**
 * Bottom-sheet filter editor (mobile + tablet). Edits a draft locally and only
 * commits on Apply — so toggling chips inside the sheet doesn't fire a search
 * per click. Reset clears the draft (preserving the search query).
 */
export function FiltersSheet({
  open,
  filters,
  totalResults,
  onApply,
  onClose,
}: FiltersSheetProps) {
  const [draft, dispatch] = useReducer(filtersReducer, filters);
  const scrimRef = useRef<HTMLDivElement>(null);

  // Reset the draft each time the sheet opens with a fresh source of truth.
  useEffect(() => {
    if (open) dispatch({ type: 'replace', filters });
  }, [open, filters]);

  // Esc closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock background scroll while open.
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
      aria-label="Filters"
      onClick={(e) => {
        if (e.target === scrimRef.current) onClose();
      }}
    >
      <div className={styles.sheet}>
        <div className={styles.handle} aria-hidden="true" />
        <div className={styles.head}>
          <div className={styles.title}>Filters</div>
          <button
            type="button"
            className={styles.reset}
            onClick={() => dispatch({ type: 'reset' })}
          >
            Reset
          </button>
        </div>
        <div className={styles.body}>
          <FiltersPanel filters={draft} dispatch={dispatch as Dispatch<FilterAction>} />
        </div>
        <div className={styles.foot}>
          <Button variant="outline" full onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" full onClick={() => onApply(draft)}>
            {totalResults > 0
              ? `Show ${totalResults.toLocaleString()} recipes`
              : 'Apply filters'}
          </Button>
        </div>
      </div>
    </div>
  );
}
