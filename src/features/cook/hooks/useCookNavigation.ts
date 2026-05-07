/**
 * useCookNavigation — step state + keyboard shortcuts for Cook Mode.
 *
 * Bindings:
 *   ArrowRight / Space / Enter → next step
 *   ArrowLeft                  → previous step
 *   Escape                     → bubbles up so the route can decide what to
 *                                do (we don't unilaterally exit; the route
 *                                may want to confirm-cancel a timer first).
 *
 * Keyboard listener is attached to `window` so cooking with the phone propped
 * on a counter and a keyboard nearby still works. Inputs/textareas (none in
 * Cook Mode today) get explicit defaults — we ignore key events when an
 * editable element is focused.
 */

import { useCallback, useEffect, useState } from 'react';

export interface CookNavigation {
  index: number;
  count: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
}

export function useCookNavigation(
  count: number,
  options: {
    /** Called on Escape so the parent can navigate out. */
    onExit?: () => void;
  } = {},
): CookNavigation {
  const [index, setIndex] = useState(0);
  const { onExit } = options;

  // If the recipe changes (count drops), clamp.
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, count - 1)));
  }, [count]);

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, count - 1));
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      setIndex(Math.max(0, Math.min(i, count - 1)));
    },
    [count],
  );

  useEffect(() => {
    if (count === 0) return undefined;
    const onKey = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement | null;
      const editable =
        tgt &&
        (tgt.tagName === 'INPUT' ||
          tgt.tagName === 'TEXTAREA' ||
          tgt.isContentEditable);
      if (editable) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.key === 'Escape') {
        onExit?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, next, prev, onExit]);

  return {
    index,
    count,
    isFirst: index === 0,
    isLast: index === count - 1,
    next,
    prev,
    goTo,
  };
}
