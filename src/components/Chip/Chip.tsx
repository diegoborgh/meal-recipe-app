import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Chip.module.css';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active?: boolean;
  leadIcon?: IconName;
  /** When provided, renders an inline × that calls this without firing the chip's click. */
  onRemove?: () => void;
  children: ReactNode;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { active, leadIcon, onRemove, className, children, ...rest },
  ref,
) {
  const cls = [
    styles.chip,
    active ? styles.active : '',
    onRemove ? styles.removable : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <button ref={ref} className={cls} aria-pressed={active} {...rest}>
      {leadIcon && <Icon name={leadIcon} size={14} />}
      {children}
      {onRemove && (
        <span
          role="button"
          tabIndex={-1}
          aria-label="Remove"
          className={styles.removeButton}
          onClick={handleRemove}
        >
          <Icon name="close" size={12} />
        </span>
      )}
    </button>
  );
});
