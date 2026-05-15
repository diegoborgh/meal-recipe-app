/**
 * playAlarm — fire a soft, kitchen-friendly "ding" when a Cook Mode timer
 * completes. Web Audio for the chime (no asset to ship and no autoplay-policy
 * issues since this is a direct response to user-initiated Start), and the
 * Vibration API for a quiet haptic on devices that support it.
 *
 * Errors are swallowed: a missing/blocked audio context or a browser that
 * doesn't honor `navigator.vibrate` should not crash the timer flow. Same
 * graceful-degradation pattern as useWakeLock.
 *
 * The chime is two short overlapping sine tones (G5 + C6) with a soft
 * attack/decay envelope. ~1.4s total, quieter than the default beep.
 */

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

export function playAlarm(): void {
  // Chime
  const ctx = createContext();
  if (ctx) {
    try {
      // Some browsers (notably Safari) suspend new contexts until a user
      // gesture resumes them. Since playAlarm fires inside an interval
      // callback, not a click, resume() is best-effort.
      void ctx.resume?.().catch(() => {});
      playTone(ctx, 784, 0, 0.55, 0.22); // G5
      playTone(ctx, 1047, 0.18, 0.85, 0.18); // C6 — overlapping
      // Close the context after the longest tone has finished, so we don't
      // leak audio nodes if the page stays open.
      window.setTimeout(() => {
        ctx.close().catch(() => {});
      }, 1500);
    } catch {
      // Soft-fail — the timer's visual "Done" state still communicates completion.
    }
  }

  // Haptic
  try {
    navigator.vibrate?.([400, 200, 400, 200, 600]);
  } catch {
    // ignore
  }
}
