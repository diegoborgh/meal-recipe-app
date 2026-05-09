import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { autocompleteIngredient } from '@/api/fridge';
import { useFridge } from '@/context/FridgeContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { SpoonacularIngredientAutocompleteHit } from '@/types/api';
import styles from './IngredientChipInput.module.css';

const SPOONACULAR_INGREDIENT_IMG = (filename: string) =>
  `https://img.spoonacular.com/ingredients_100x100/${filename}`;

export interface IngredientChipInputProps {
  /** When true, render the dashed-border empty-state variant. */
  emptyVariant?: boolean;
  placeholder?: string;
}

/**
 * The fridge input: chip strip + free-typing autocomplete + Enter-to-add.
 *
 * Adding logic:
 *   - Click a suggestion → add canonical Spoonacular name + id.
 *   - Press Enter with no highlighted suggestion → add raw text (no id).
 *   - Both go through FridgeContext.add which dedupes via lowercased name.
 *
 * Removing: chip's × calls FridgeContext.remove.
 */
export function IngredientChipInput({
  emptyVariant,
  placeholder = "Type an ingredient — eggs, spinach, garlic…",
}: IngredientChipInputProps) {
  const { names, add, remove } = useFridge();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [suggestions, setSuggestions] = useState<SpoonacularIngredientAutocompleteHit[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const debounced = useDebouncedValue(text, 200);

  // Fetch suggestions when the debounced query changes.
  useEffect(() => {
    abortRef.current?.abort();
    const trimmed = debounced.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;
    autocompleteIngredient(trimmed, 8, { signal: ac.signal })
      .then((hits) => {
        if (ac.signal.aborted) return;
        setSuggestions(hits);
        setHighlight(-1);
      })
      .catch(() => {
        // Autocomplete is non-critical — fail quietly.
      });
    return () => ac.abort();
  }, [debounced]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const commit = (name: string, spoonacularId: number | null) => {
    if (!name.trim()) return;
    void add(name, spoonacularId);
    setText('');
    setOpen(false);
    setHighlight(-1);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = highlight >= 0 ? suggestions[highlight] : null;
      if (picked) {
        commit(picked.name, null);
      } else if (text.trim()) {
        commit(text, null);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    } else if (e.key === 'Backspace' && text === '' && names.length > 0) {
      // Backspace on an empty input deletes the most recent chip.
      const last = names[names.length - 1];
      if (last) void remove(last);
    }
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={`${styles.field} ${emptyVariant ? styles.fieldEmpty : ''}`}>
        {emptyVariant && names.length === 0 && (
          <Icon name="plus" size={18} color="var(--color-accent-2)" strokeWidth={2.2} />
        )}
        {names.map((n) => (
          <Chip
            key={n}
            active
            className={styles.chip}
            onRemove={() => void remove(n)}
          >
            {n}
          </Chip>
        ))}
        <input
          ref={inputRef}
          className={styles.input}
          value={text}
          placeholder={names.length === 0 ? placeholder : 'Add another…'}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
      </div>
      {open && suggestions.length > 0 && (
        <div role="listbox" className={styles.suggestions}>
          {suggestions.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              type="button"
              role="option"
              aria-selected={i === highlight}
              className={`${styles.suggestion} ${
                i === highlight ? styles.suggestionActive : ''
              }`}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                commit(s.name, null);
              }}
            >
              {s.image ? (
                <img
                  className={styles.suggestionImg}
                  src={SPOONACULAR_INGREDIENT_IMG(s.image)}
                  alt=""
                  loading="lazy"
                />
              ) : (
                <span className={styles.suggestionImg} aria-hidden="true" />
              )}
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
