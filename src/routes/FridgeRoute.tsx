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
 * Two surface states share the same shell:
 *   1. Fridge empty: chip input (dashed/empty variant) + starter chips +
 *      "How this works" callout.
 *   2. Fridge populated: chip input (solid border) + results, mobile as
 *      stacked rows, desktop as a card grid.
 *
 * The results hook is debounced so adding a few starters in quick succession
 * doesn't fire one API call per chip click.
 */
export function FridgeRoute() {
  const isDesktop = useIsDesktop();
  const { names, loaded } = useFridge();
  const isEmpty = loaded && names.length === 0;

  const { matches, loading, error, quotaExceeded, refetch } = useFridgeRecipes(names);

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
      </header>

      {isEmpty && <FridgeEmpty />}

      {!isEmpty && names.length > 0 && (
        <>
          <div className={styles.resultsHead}>
            <div className={styles.resultsCount}>
              {loading && matches.length === 0 ? (
                'Finding recipes…'
              ) : (
                <>
                  <span className={styles.resultsCountStrong}>
                    {matches.length} {matches.length === 1 ? 'recipe' : 'recipes'}
                  </span>{' '}
                  from your fridge
                </>
              )}
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
              {...(refetch ? { onRetry: refetch } : {})}
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
    </div>
  );
}
