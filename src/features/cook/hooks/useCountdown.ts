/**
 * useCountdown — wall-clock-driven countdown timer.
 *
 * `remainingSec` is computed from `Date.now() - startedAt`, NOT by
 * incrementing a counter. This is what keeps the timer accurate across
 * tab-backgrounding and OS screen-locks: the browser may pause our interval
 * while hidden, but the moment we re-render we read the actual elapsed time
 * and the number jumps to where it should be.
 *
 * The 250ms interval is only a re-render driver — it does not advance any
 * internal counter. It also stops once the timer hits zero, so a "done" card
 * doesn't pay for unnecessary renders.
 *
 * `onComplete` is latched per `startedAt` value: it fires exactly once when a
 * given run transitions to remainingSec === 0. Restarting (new `startedAt`)
 * re-arms the latch.
 */

import { useEffect, useRef, useState } from 'react';

export interface UseCountdownArgs {
  /** Wall-clock ms when the run began. null = idle, no countdown active. */
  startedAt: number | null;
  /** Total duration in whole seconds. */
  totalSec: number;
  /** Fires once when remainingSec hits zero for this `startedAt`. */
  onComplete: () => void;
}

export interface UseCountdownState {
  remainingSec: number;
  isDone: boolean;
}

function computeRemaining(startedAt: number | null, totalSec: number, now: number): number {
  if (startedAt == null) return totalSec;
  const elapsed = Math.floor((now - startedAt) / 1000);
  return Math.max(0, totalSec - elapsed);
}

export function useCountdown({
  startedAt,
  totalSec,
  onComplete,
}: UseCountdownArgs): UseCountdownState {
  const [now, setNow] = useState(() => Date.now());

  // Latch for onComplete. Stores the `startedAt` value we've already fired
  // for, so a single run only fires once even across re-renders.
  const firedForRef = useRef<number | null>(null);

  // Pin the callback in a ref so the firing effect doesn't re-run when the
  // caller passes a fresh function on every render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Resync `now` whenever a new run begins so the first read is accurate
  // (otherwise the first tick is up to 250ms stale).
  useEffect(() => {
    if (startedAt != null) setNow(Date.now());
  }, [startedAt]);

  // 250ms re-render driver. Only runs while a timer is active AND not done.
  useEffect(() => {
    if (startedAt == null) return undefined;
    if (computeRemaining(startedAt, totalSec, Date.now()) === 0) return undefined;
    const id = window.setInterval(() => {
      const tNow = Date.now();
      setNow(tNow);
      if (computeRemaining(startedAt, totalSec, tNow) === 0) {
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [startedAt, totalSec]);

  const remainingSec = computeRemaining(startedAt, totalSec, now);
  const isDone = startedAt != null && remainingSec === 0;

  // Fire onComplete exactly once per startedAt.
  useEffect(() => {
    if (isDone && startedAt != null && firedForRef.current !== startedAt) {
      firedForRef.current = startedAt;
      onCompleteRef.current();
    }
  }, [isDone, startedAt]);

  return { remainingSec, isDone };
}
