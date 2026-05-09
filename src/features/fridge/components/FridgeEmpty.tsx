import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { useFridge } from '@/context/FridgeContext';
import styles from './FridgeEmpty.module.css';

const STARTERS = [
  'Eggs',
  'Chicken',
  'Pasta',
  'Rice',
  'Tomatoes',
  'Spinach',
  'Garlic',
  'Onion',
  'Cheese',
  'Lemon',
];

export interface FridgeEmptyProps {
  /** When true, shows the "How this works" callout. Used on first-visit only. */
  showHowItWorks?: boolean;
}

/**
 * Pre-search guidance for the Fridge route. Two pieces:
 *   1. Starter chips — filtered to those NOT already in the fridge, so the
 *      row shrinks as the user adds rather than disappearing wholesale on the
 *      first tap.
 *   2. "How this works" callout — onboarding for the first-visit empty state
 *      only; toggled off once the user has any items.
 *
 * Renders nothing when there's nothing left to suggest AND onboarding is off.
 */
export function FridgeEmpty({ showHowItWorks = true }: FridgeEmptyProps) {
  const { add, has } = useFridge();
  const remaining = STARTERS.filter((s) => !has(s));

  if (remaining.length === 0 && !showHowItWorks) return null;

  return (
    <div className={styles.frame}>
      {remaining.length > 0 && (
        <div className={styles.section}>
          <div className={styles.label}>Common starters · tap to add</div>
          <div className={styles.starters}>
            {remaining.map((s) => (
              <Chip
                key={s}
                leadIcon="plus"
                onClick={() => void add(s)}
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {showHowItWorks && (
        <div className={styles.howCard}>
          <div className={styles.howIcon}>
            <Icon name="info" size={18} />
          </div>
          <div>
            <div className={styles.howTitle}>How this works</div>
            <div className={styles.howBody}>
              Add 4–6 ingredients you have. Recipes are ranked by how few extras
              you'd need to buy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
