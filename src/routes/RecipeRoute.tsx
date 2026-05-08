import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/Button';
import { DietBadge } from '@/components/DietBadge';
import { Icon } from '@/components/Icon';
import { ErrorState, LoadingState } from '@/components/states';
import { useFavorites } from '@/context/FavoritesContext';
import { usePreferences, type Units } from '@/context/PreferencesContext';
import { useIsDesktop } from '@/hooks/useBreakpoint';
import { IngredientsList } from '@/features/recipe/components/IngredientsList';
import { InstructionsList } from '@/features/recipe/components/InstructionsList';
import { NutritionStrip } from '@/features/recipe/components/NutritionStrip';
import { RecipeHero } from '@/features/recipe/components/RecipeHero';
import { ServingsAdjuster } from '@/features/recipe/components/ServingsAdjuster';
import { UnitToggle } from '@/features/recipe/components/UnitToggle';
import { useRecipe } from '@/features/recipe/hooks/useRecipe';
import styles from './RecipeRoute.module.css';

/**
 * Recipe Detail (Browse Mode). Layout differs significantly between mobile and
 * desktop, but the data + state shape is shared:
 *
 *   - servings: local UI state, initialized from the recipe's original servings.
 *     Scales ingredient amounts in real time. Does NOT affect nutrition stats
 *     (those stay per-serving by definition).
 *   - units: local UI state, initialized from preferences.units. The toggle
 *     does NOT update the saved preference — a one-off look at metric on a
 *     recipe shouldn't change defaults.
 *   - "Start cooking" navigates to /recipe/:id/cook (slice 4).
 */
export function RecipeRoute() {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { isSaved, toggle } = useFavorites();
  const { preferences } = usePreferences();

  // Parse the id once. Bad input → render error inline rather than crash.
  const id = idParam && /^\d+$/.test(idParam) ? Number(idParam) : null;

  const { recipe, loading, error, quotaExceeded, refetch } = useRecipe(id);

  // Local UI state. servings init lazily once recipe arrives, then stays sticky
  // across re-renders unless the user adjusts it.
  const [servingsOverride, setServingsOverride] = useState<number | null>(null);
  const [units, setUnits] = useState<Units>(preferences.units);

  const servings =
    servingsOverride ?? recipe?.servings ?? 1;

  // Bad id
  if (id == null) {
    return (
      <div className={styles.errorWrap}>
        <ErrorState
          title="That recipe doesn’t exist."
          body="The link may be old or mistyped."
          onRetry={() => navigate('/')}
        />
      </div>
    );
  }

  if (loading || (!recipe && !error)) {
    return <LoadingState label="Loading recipe…" />;
  }

  if (error || !recipe) {
    return (
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
    );
  }

  const goCook = () => navigate(`/recipe/${id}/cook`);
  // Recipe extends RecipeSummary so we can pass it directly — toggle only
  // reads the summary fields when saving.
  const onToggleSave = () => void toggle(recipe);
  const saved = isSaved(id);

  // Attribution line: "Adapted from <Source>" with link to source when available.
  const attribution = recipe.sourceName ? (
    recipe.sourceUrl ? (
      <>
        Adapted from{' '}
        <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
          {recipe.sourceName}
        </a>
      </>
    ) : (
      <>Adapted from {recipe.sourceName}</>
    )
  ) : (
    'From Spoonacular'
  );

  if (isDesktop) {
    return (
      <div className={styles.page}>
        <button
          type="button"
          className={styles.desktopBack}
          onClick={() => navigate(-1)}
        >
          <Icon name="arrowL" size={14} /> Back to results
        </button>
        <div className={styles.desktopGrid}>
          <div className={styles.desktopLeft}>
            <RecipeHero
              {...(recipe.image ? { image: recipe.image } : {})}
              alt={recipe.title}
              saved={saved}
              onToggleSave={onToggleSave}
              onBack={() => navigate(-1)}
              variant="desktop"
            />
            <div className={styles.desktopIngredientsHead}>
              <div className={styles.desktopSectionTitle}>Ingredients</div>
              <div className={styles.desktopIngredientsControls}>
                <ServingsAdjuster
                  value={servings}
                  onChange={(n) => setServingsOverride(n)}
                />
                <UnitToggle value={units} onChange={setUnits} />
              </div>
            </div>
            <IngredientsList
              ingredients={recipe.ingredients}
              originalServings={recipe.servings}
              servings={servings}
              units={units}
            />
          </div>

          <div className={styles.desktopRight}>
            <div>
              {recipe.badges.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {recipe.badges.map((b, i) => (
                    <DietBadge key={i} tone={b.tone}>
                      {b.label}
                    </DietBadge>
                  ))}
                </div>
              )}
              <h1 className={styles.desktopHeading}>{recipe.title}</h1>
              <div className={styles.attribution}>{attribution}</div>
            </div>

            <NutritionStrip recipe={recipe} servings={servings} />

            <h2 className={styles.desktopSectionTitle} style={{ marginTop: 4 }}>
              How to make it
            </h2>
            <InstructionsList steps={recipe.steps} />

            <Button
              variant="primary"
              size="lg"
              trailIcon="arrow"
              full
              onClick={goCook}
              className={styles.desktopCta}
            >
              Start cooking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile layout ────────────────────────────────────────────────────────
  return (
    <div className={styles.mobileShell}>
      <RecipeHero
        {...(recipe.image ? { image: recipe.image } : {})}
        alt={recipe.title}
        saved={saved}
        onToggleSave={onToggleSave}
        onBack={() => navigate(-1)}
        variant="mobile"
      />
      <div className={styles.mobileSheet}>
        <div>
          {recipe.badges.length > 0 && (
            <div className={styles.mobileBadges}>
              {recipe.badges.map((b, i) => (
                <DietBadge key={i} tone={b.tone}>
                  {b.label}
                </DietBadge>
              ))}
            </div>
          )}
          <h1 className={styles.mobileTitle}>{recipe.title}</h1>
          <div className={styles.attribution}>{attribution}</div>
        </div>

        <NutritionStrip recipe={recipe} servings={servings} />

        <div className={styles.mobileSectionHead}>
          <div className={styles.sectionTitle}>Ingredients</div>
          <ServingsAdjuster
            value={servings}
            onChange={(n) => setServingsOverride(n)}
          />
        </div>
        <div className={styles.mobileSectionMeta}>
          <UnitToggle value={units} onChange={setUnits} />
        </div>
        <IngredientsList
          ingredients={recipe.ingredients}
          originalServings={recipe.servings}
          servings={servings}
          units={units}
        />

        <div className={styles.sectionTitle} style={{ marginTop: 4 }}>
          How to make it
        </div>
        <InstructionsList steps={recipe.steps} />
      </div>

      <div className={styles.mobileCta}>
        <Button
          variant="primary"
          size="lg"
          trailIcon="arrow"
          full
          onClick={goCook}
        >
          Start cooking
        </Button>
      </div>
    </div>
  );
}
