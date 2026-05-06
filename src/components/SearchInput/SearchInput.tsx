import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Icon } from '../Icon';
import styles from './SearchInput.module.css';

export type SearchInputSize = 'sm' | 'md' | 'lg';

export interface SearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'> {
  /** Controlled value. */
  value?: string;
  /** Plain string change handler — most callers want the value, not the event. */
  onChange?: (value: string) => void;
  size?: SearchInputSize;
  placeholder?: string;
}

const ICON_SIZE: Record<SearchInputSize, number> = { sm: 16, md: 18, lg: 20 };

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, size = 'md', placeholder = 'Search recipes…', className, ...rest },
  ref,
) {
  return (
    <div className={`${styles.wrap} ${styles[size]} ${className ?? ''}`}>
      <Icon name="search" size={ICON_SIZE[size]} color="var(--color-ink-soft)" />
      <input
        ref={ref}
        type="search"
        className={styles.input}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        {...rest}
      />
    </div>
  );
});
