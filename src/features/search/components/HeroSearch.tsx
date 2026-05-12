import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SearchInput, type SearchInputSize } from '@/components/SearchInput';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { AutocompleteList } from './AutocompleteList';
import styles from './HeroSearch.module.css';

export interface HeroSearchProps {
  /** Initial text content; updates from outside (URL → state) overwrite local. */
  value: string;
  size?: SearchInputSize;
  placeholder?: string;
  /** Fired on Enter or autocomplete pick. Receives the chosen text or, when a
   *  suggestion was picked, that suggestion's title + id. */
  onSubmit: (text: string, pickedId?: number) => void;
}

/**
 * Search input + autocomplete dropdown, keyboard-navigable. Used by Home and
 * SearchRoute. Dropdown closes on blur, Esc, or pick. Arrow keys cycle through
 * suggestions; Enter submits the highlighted one (or the raw text if none).
 */
export function HeroSearch({
  value,
  size = 'md',
  placeholder = 'Search recipes…',
  onSubmit,
}: HeroSearchProps) {
  const [text, setText] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (URL → state).
  useEffect(() => setText(value), [value]);

  const { suggestions } = useAutocomplete(text, open);

  // Reset highlight when the suggestion list changes shape.
  useEffect(() => {
    setHighlight(-1);
  }, [suggestions.length]);

  // Click-outside closes the dropdown.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

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
      const picked = highlight >= 0 ? suggestions[highlight] : undefined;
      if (picked) {
        setText(picked.title);
        setOpen(false);
        onSubmit(picked.title, picked.id);
      } else {
        setOpen(false);
        onSubmit(text);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <SearchInput
        size={size}
        placeholder={placeholder}
        value={text}
        onChange={(v) => {
          setText(v);
          setOpen(true);
          // Clearing the field is a definitive "no query" — commit immediately.
          // Mid-edit non-empty text still waits for Enter so we don't fire
          // a search per keystroke.
          if (v === '' && text !== '') onSubmit('');
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
      />
      {open && (
        <AutocompleteList
          suggestions={suggestions}
          highlightedIndex={highlight}
          onHover={setHighlight}
          onPick={(s) => {
            setText(s.title);
            setOpen(false);
            onSubmit(s.title, s.id);
          }}
        />
      )}
    </div>
  );
}
