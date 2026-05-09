import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { ErrorState } from '@/components/states';
import { useFridge } from '@/context/FridgeContext';
import { FridgeCard } from '@/features/fridge/components/FridgeCard';
import { FridgeEmpty } from '@/features/fridge/components/FridgeEmpty';
import { IngredientChipInput } from '@/features/fridge/components/IngredientChipInput';
import { useFridgeRecipes } from '@/features/fridge/hooks/useFridgeRecipes';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import styles from './FridgeRoute.module.css';

/**
 * "What's in your fridge?" — find recipes from the user's pantry.
 *
 * Trigger model: searches are EXPLICIT. The live fridge (FridgeContext) is
 * what the user is editing; `committed` is what's been submitted for search.
 * Tapping "Find recipes" copies live → committed and the hook fires.
 *
 * Why not auto-fire: findByIngredients costs ~1pt per result × 20 results =
 * up to 20 points per search. Auto-firing on each chip click would burn the
 * 150-point daily quota in one cooking session.
 *
 * Stale hint: when names ≠ committed (after a search), a small "Ingredients
 * changed" cue shows next to the button so the user knows results don't
 * reflect their current chips.
 */
export function FridgeRoute() {
  const isDesktop = useIsDesktop();
  const { names, loaded } = useFridge();
  const isEmpty = loaded && names.length === 0;

  const [committed, setCommitted] = useState<string[]>([]);

  const { matches, loading, error, quotaExceeded, refetch } =
    useFridgeRecipes(committed);

  // "Stale" = user has edited the fridge since last search. Compared as
  // sorted sets so order changes don't trigger the cue.
  const isStale = useMemo(() => {
    if (committed.length === 0) return false;
    const a = [...names].sort();
    const b = [...committed].sort();
    if (a.length !== b.length) return true;
    return a.some((name, i) => name !== b[i]);
  }, [names, committed]);

  const hasNeverSearched = committed.length === 0;
  const canSearch = names.length > 0;

  const onFind = () => {
    if (!canSearch) return;
    setCommitted([...names]);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          What's in your <em className={styles.titleAccent}>fridge</em>?
        </h1>
        <p className={styles.subtitle}>
          {isEmpty
            ? "Add a few things you've got. We'll find recipes that use as many as possible."
            : "Add what you've got — we'll find recipes that use as many as possible."}
        </p>
        <IngredientChipInput emptyVariant={isEmpty} />

        {!isEmpty && (
          <div className={styles.actionRow}>
            <Button
              variant="primary"
              leadIcon="search"
              onClick={onFind}
              disabled={!canSearch || loading}
            >
              {loading
                ? 'Finding…'
                : hasNeverSearched
                  ? `Find recipes (${names.length})`
                  : isStale
                    ? `Refresh (${names.length})`
                    : 'Find recipes'}
            </Button>
            {isStale && !loading && (
              <span className={styles.staleHint}>
                Ingredients changed — refresh to update
              </span>
            )}
          </div>
        )}
      </header>

      {isEmpty && <FridgeEmpty />}

      {!isEmpty && (
        <>
          {hasNeverSearched && !loading && (
            <div className={styles.idleHint}>
              Add the ingredients you have, then tap{' '}
              <strong>Find recipes</strong>.
            </div>
          )}

          {!hasNeverSearched && (
            <>
              <div className={styles.resultsHead}>
                <div className={styles.resultsCount}>
                  {loading && matches.length === 0 ? (
                    'Finding recipes…'
                  ) : matches.length > 0 ? (
                    <>
                      <span className={styles.resultsCountStrong}>
                        {matches.length}{' '}
                        {matches.length === 1 ? 'recipe' : 'recipes'}
                      </span>{' '}
                      from your fridge
                    </>
                  ) : null}
                </div>
                {matches.length > 0 && (
                  <span className={styles.sortHint}>Most matches first</span>
                )}
              </div>

              {error && matches.length === 0 ? (
                <div className={styles.errorWrap}>
                  <ErrorState
                    {...(quotaExceeded
                      ? {
                          title: 'Caught our breath.',
                          body: 'We’ve hit today’s recipe quota. Try again later, or tap into your saved recipes.',
                        }
                      : {})}
                    onRetry={refetch}
                  />
                </div>
              ) : matches.length === 0 && !loading ? (
                <ErrorState
                  title="Nothing matches yet."
                  body="Try adding one or two more ingredients — variety helps."
                  onRetry={refetch}
                />
              ) : (
                <div className={styles.list}>
                  {matches.map((m) => (
                    <FridgeCard
                      key={m.id}
                      match={m}
                      variant={isDesktop ? 'card' : 'row'}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
