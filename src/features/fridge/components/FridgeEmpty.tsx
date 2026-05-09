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

/**
 * Shown when the fridge is empty — gives the user a one-tap path to populate
 * a few starters + a small "How this works" explainer.
 */
export function FridgeEmpty() {
  const { add } = useFridge();

  return (
    <div className={styles.frame}>
      <div className={styles.section}>
        <div className={styles.label}>Common starters · tap to add</div>
        <div className={styles.starters}>
          {STARTERS.map((s) => (
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
    </div>
  );
}
