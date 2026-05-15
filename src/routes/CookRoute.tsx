import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '@/components/states';
import { usePreferences, type Units } from '@/context/PreferencesContext';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { CookBottomBar } from '@/features/cook/components/CookBottomBar';
import { CookSkeleton } from '@/features/cook/components/CookSkeleton';
import { CookStep, type CookStepTimerProps } from '@/features/cook/components/CookStep';
import { CookTopBar } from '@/features/cook/components/CookTopBar';
import { IngredientsPeek } from '@/features/cook/components/IngredientsPeek';
import type { TimerCardState } from '@/features/cook/components/TimerCard';
import { TimerPill } from '@/features/cook/components/TimerPill';
import { useCookNavigation } from '@/features/cook/hooks/useCookNavigation';
import { useCountdown } from '@/features/cook/hooks/useCountdown';
import { useWakeLock } from '@/features/cook/hooks/useWakeLock';
import { playAlarm } from '@/features/cook/lib/alarm';
import { useRecipe } from '@/features/recipe/hooks/useRecipe';
import styles from './CookRoute.module.css';

interface ActiveTimer {
  stepIndex: number;
  totalSec: number;
  startedAt: number;
}

/**
 * Cook Mode B — the protected anchor.
 *
 * One step at a time, very large type, terracotta Next button, wake-lock
 * active. Exit returns to the recipe's Browse page (not the search results) —
 * users naturally Cook Mode → Browse to peek at ingredients/notes.
 *
 * Recipe data: we fetch via useRecipe like the Browse page would. With the
 * 24h edge cache, navigating Browse → Cook is essentially free.
 */
export function CookRoute() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { preferences } = usePreferences();

  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;
  const { recipe, loading, error, quotaExceeded, refetch } = useRecipe(id);

  // UI state. We deliberately don't share with Browse: a user might cook in
  // metric without changing their default, and the servings adjuster lives
  // on the Browse page (intentional split — Cook is for cooking, not editing).
  const [units] = useState<Units>(preferences.units);
  const [peekOpen, setPeekOpen] = useState(false);

  // Cook Mode timer state — single timer at a time, lifted to the route so
  // it survives step navigation (slice 3 surfaces it via a persistent pill).
  // Cleared on exit so re-entering Cook Mode always starts fresh.
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const { remainingSec, isDone } = useCountdown({
    startedAt: activeTimer?.startedAt ?? null,
    totalSec: activeTimer?.totalSec ?? 0,
    // Latched in useCountdown — fires exactly once per startedAt.
    onComplete: playAlarm,
  });

  const exit = useCallback(() => {
    setActiveTimer(null);
    setDismissed(false);
    if (id != null) navigate(`/recipe/${id}`);
    else navigate(-1);
  }, [id, navigate]);

  const nav = useCookNavigation(recipe?.steps.length ?? 0, {
    onExit: () => {
      if (peekOpen) setPeekOpen(false);
      else exit();
    },
  });

  // Wake lock only while we have a real cooking session — not during loading
  // or error states.
  useWakeLock(!!recipe && recipe.steps.length > 0);

  // Timer handlers are hooks, so they must be declared before any conditional
  // return. handleStartTimer looks up the current step's duration via `recipe`
  // + `nav.index` so the lookup stays valid even before the early-return ladder
  // narrows `recipe` to non-null.
  const handleStartTimer = useCallback(() => {
    const dm = recipe?.steps[nav.index]?.durationMinutes ?? null;
    if (dm == null) return;
    // Replace-confirm: protect a running timer on another step from accidental
    // overwrite. No prompt when the current step IS the active timer's step
    // (re-tapping Start after a finished+dismissed run on this same step).
    if (activeTimer != null && activeTimer.stepIndex !== nav.index) {
      const ok = window.confirm('Replace running timer?');
      if (!ok) return;
    }
    setActiveTimer({
      stepIndex: nav.index,
      totalSec: dm * 60,
      startedAt: Date.now(),
    });
    setDismissed(false);
  }, [activeTimer, recipe, nav.index]);

  const handleStopTimer = useCallback(() => {
    setActiveTimer(null);
    setDismissed(false);
  }, []);

  const handleDismissTimer = useCallback(() => {
    setActiveTimer(null);
    setDismissed(false);
  }, []);

  // Bad id
  if (id == null) {
    return (
      <div className={styles.shell}>
        <div className={styles.errorWrap}>
          <ErrorState
            title="That recipe doesn’t exist."
            body="The link may be old or mistyped."
            action={{
              label: 'Back to Cook',
              icon: 'home',
              onClick: () => navigate('/'),
            }}
          />
        </div>
      </div>
    );
  }

  if (loading || (!recipe && !error)) {
    return (
      <div className={styles.shell}>
        <div className={styles.body}>
          <CookSkeleton />
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className={styles.shell}>
        <div className={styles.errorWrap}>
          <ErrorState
            {...(quotaExceeded
              ? {
                  title: 'Caught our breath.',
                  body: 'We’ve hit today’s recipe quota. Try again later.',
                }
              : {})}
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  const steps = recipe.steps;
  if (steps.length === 0) {
    // Recipe came back without instructions — common for some Spoonacular
    // entries. Send the user back to Browse where they'll see the source link.
    return (
      <div className={styles.shell}>
        <div className={styles.errorWrap}>
          <ErrorState
            title="No step-by-step here."
            body="This recipe doesn’t have structured steps. The source link on the recipe page should have the full method."
            action={{
              label: 'Back to recipe',
              icon: 'arrowL',
              onClick: () => navigate(`/recipe/${id}`),
            }}
          />
        </div>
      </div>
    );
  }

  const currentStep = steps[nav.index] ?? { text: '', durationMinutes: null };

  // Derive the TimerCard's visual state for the current step. The active
  // timer's step may differ from the user's current step (they advanced
  // without stopping it) — in which case this step's card stays 'idle'
  // and the TimerPill surfaces the timer instead.
  const isActiveOnThisStep =
    activeTimer != null && activeTimer.stepIndex === nav.index;
  const isActiveOnOtherStep =
    activeTimer != null && activeTimer.stepIndex !== nav.index;
  const timerState: TimerCardState = !isActiveOnThisStep
    ? 'idle'
    : isDone && !dismissed
      ? 'done'
      : 'running';

  const timerProps: CookStepTimerProps = {
    state: timerState,
    remainingSec: isActiveOnThisStep ? remainingSec : 0,
    onStart: handleStartTimer,
    onStop: handleStopTimer,
    onDismiss: handleDismissTimer,
  };

  return (
    <div className={styles.shell}>
      <CookTopBar
        count={nav.count}
        index={nav.index}
        onExit={exit}
        onToggleIngredients={() => setPeekOpen((v) => !v)}
        onJump={nav.goTo}
        isDesktop={isDesktop}
      />

      <div className={styles.body}>
        <CookStep
          index={nav.index}
          count={nav.count}
          step={currentStep}
          recipeTitle={recipe.title}
          timer={timerProps}
        />
      </div>

      {isActiveOnOtherStep && activeTimer && (
        <TimerPill
          stepNumber={activeTimer.stepIndex + 1}
          remainingSec={remainingSec}
          isDone={isDone}
          onJump={() => nav.goTo(activeTimer.stepIndex)}
        />
      )}

      <CookBottomBar
        isFirst={nav.isFirst}
        isLast={nav.isLast}
        onPrev={nav.prev}
        onNext={nav.next}
        onDone={exit}
      />

      <IngredientsPeek
        open={peekOpen}
        recipe={recipe}
        servings={recipe.servings}
        units={units}
        onClose={() => setPeekOpen(false)}
      />
    </div>
  );
}
