import { Icon } from '@/components/Icon';
import styles from './IngredientRow.module.css';

export interface IngredientRowProps {
  name: string;
  /** Pre-formatted, scaled amount string ("1 ½"). */
  amount: string;
  unit: string;
  /** Whether the user already has this ingredient (Fridge feature, slice 7). */
  have?: boolean;
  /** User can manually check off as they cook. Optional. */
  checked?: boolean;
  onToggle?: () => void;
  divider?: boolean;
}

/**
 * One ingredient row with a checkbox affordance. Two ways the box turns green:
 *   - `have=true` from Fridge match (slice 7)
 *   - `checked=true` from manual cook-along check
 *
 * For slice 3 only `checked` is wired; `have` is a no-op until the Fridge
 * feature lands.
 */
export function IngredientRow({
  name,
  amount,
  unit,
  have,
  checked,
  onToggle,
  divider,
}: IngredientRowProps) {
  const isOn = !!(checked || have);
  return (
    <div className={`${styles.row} ${divider ? styles.divider : ''}`}>
      <button
        type="button"
        className={`${styles.checkbox} ${isOn ? styles.checkboxChecked : ''}`}
        aria-checked={isOn}
        role="checkbox"
        aria-label={`${isOn ? 'Uncheck' : 'Check'} ${name}`}
        onClick={onToggle}
      >
        {isOn && <Icon name="check" size={13} color="#fff" strokeWidth={2.8} />}
      </button>
      <span className={`${styles.name} ${isOn ? styles.nameChecked : ''}`}>
        {name}
      </span>
      {amount && (
        <span className={styles.amount}>
          <span className={styles.amountValue}>{amount}</span>
          {unit && ` ${unit}`}
        </span>
      )}
    </div>
  );
}
