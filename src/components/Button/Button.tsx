import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'soft' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadIcon?: IconName;
  trailIcon?: IconName;
  full?: boolean;
  children?: ReactNode;
}

const ICON_SIZE: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18, xl: 20 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', leadIcon, trailIcon, full, className, children, ...rest },
  ref,
) {
  const cls = [
    styles.button,
    styles[size],
    styles[variant],
    full ? styles.full : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} className={cls} {...rest}>
      {leadIcon && <Icon name={leadIcon} size={ICON_SIZE[size]} />}
      {children}
      {trailIcon && <Icon name={trailIcon} size={ICON_SIZE[size]} />}
    </button>
  );
});
