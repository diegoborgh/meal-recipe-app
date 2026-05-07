import { Icon } from '@/components/Icon';
import type { SpoonacularAutocompleteHit } from '@/types/api';
import styles from './AutocompleteList.module.css';

export interface AutocompleteListProps {
  suggestions: SpoonacularAutocompleteHit[];
  highlightedIndex: number;
  onPick: (hit: SpoonacularAutocompleteHit) => void;
  onHover: (index: number) => void;
}

export function AutocompleteList({
  suggestions,
  highlightedIndex,
  onPick,
  onHover,
}: AutocompleteListProps) {
  if (suggestions.length === 0) return null;
  return (
    <div role="listbox" className={styles.list}>
      {suggestions.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="option"
          aria-selected={i === highlightedIndex}
          className={`${styles.item} ${i === highlightedIndex ? styles.itemActive : ''}`}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => {
            // Prevent input blur before click fires.
            e.preventDefault();
            onPick(s);
          }}
        >
          <Icon name="search" size={14} color="var(--color-ink-muted)" />
          <span className={styles.title}>{s.title}</span>
        </button>
      ))}
    </div>
  );
}
