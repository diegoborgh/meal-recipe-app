/**
 * Cook Mode timer alarm — a soft, kitchen-friendly "ding" when the countdown
 * completes. Web Audio for the chime (no asset to ship), Vibration API for a
 * quiet haptic on devices that support it.
 *
 * iOS Safari only lets an AudioContext leave the `suspended` state if it was
 * constructed (and resumed) inside a real user gesture. The completion callback
 * fires inside a setInterval tick — not a gesture — so we lazily create one
 * shared context the first time the user taps Start (`primeAlarm`) and reuse
 * it for every subsequent `playAlarm`. Without this, the chime is silent on
 * iOS even though everything looks right on desktop Chrome.
 *
 * Errors are swallowed: a missing/blocked audio context or a browser without
 * `navigator.vibrate` should not crash the timer flow. Same graceful-
 * degradation pattern as useWakeLock.
 *
 * The chime is two short overlapping sine tones (G5 + C6) with a soft
 * attack/decay envelope, repeated three times 1.5s apart (~4s total). One
 * round was too easy to miss in a real kitchen.
 */

const REPEAT_COUNT = 3;
const REPEAT_GAP_SEC = 1.5;

let sharedCtx: AudioContext | null = null;

function createContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as typeof window & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

function playTone(ctx: AudioContext, freq: number, startSec: number, durationSec: number, peakGain: number): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  // Envelope: fast attack, slow decay — gentler than an abrupt on/off click.
  const t0 = ctx.currentTime + startSec;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.05);
}

/**
 * Call from inside a user-gesture handler (the Start button's onClick) to
 * unlock audio on iOS Safari. Idempotent: subsequent calls reuse the same
 * context and re-resume it if the browser has suspended it (e.g. tab
 * backgrounded).
 */
export function primeAlarm(): void {
  if (sharedCtx == null) sharedCtx = createContext();
  if (sharedCtx == null) return;
  try {
    void sharedCtx.resume?.().catch(() => {});
  } catch {
    // ignore
  }
}

export function playAlarm(): void {
  // Reuse the primed context; fall back to creating one on the fly for paths
  // that bypassed priming (defensive — should not happen in normal Cook flow).
  if (sharedCtx == null) sharedCtx = createContext();
  const ctx = sharedCtx;
  if (ctx) {
    try {
      void ctx.resume?.().catch(() => {});
      for (let i = 0; i < REPEAT_COUNT; i++) {
        const offset = i * REPEAT_GAP_SEC;
        playTone(ctx, 784, offset, 0.55, 0.22); // G5
        playTone(ctx, 1047, offset + 0.18, 0.85, 0.18); // C6 — overlapping
      }
    } catch {
      // Soft-fail — the timer's visual "Done" state still communicates completion.
    }
  }

  try {
    navigator.vibrate?.([400, 200, 400, 200, 600]);
  } catch {
    // ignore
  }
}
