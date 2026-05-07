import { useNavigate } from 'react-router-dom';
import { Chip } from '@/components/Chip';
import type { IconName } from '@/components/Icon';
import { filtersToSearchParams } from '../filters';
import { EMPTY_FILTERS, type Filters } from '../types';
import styles from './QuickChips.module.css';

interface QuickPreset {
  label: string;
  icon?: IconName;
  filters: Partial<Filters>;
}

/** Curated, opinionated entry points. Each pre-fills filters and jumps to /search. */
const PRESETS: QuickPreset[] = [
  { label: 'Under 30 min', icon: 'clock', filters: { maxReadyTime: 30 } },
  { label: 'Vegetarian', icon: 'leaf', filters: { diet: 'Vegetarian' } },
  { label: 'High-protein', filters: { query: 'high protein' } },
  { label: 'Dinner', filters: { type: 'Main course' } },
  { label: 'Weeknight', filters: { maxReadyTime: 30, type: 'Main course' } },
  { label: 'One pan', filters: { query: 'sheet pan' } },
];

export function QuickChips() {
  const navigate = useNavigate();
  return (
    <div className={styles.row}>
      {PRESETS.map((p) => (
        <Chip
          key={p.label}
          {...(p.icon ? { leadIcon: p.icon } : {})}
          onClick={() => {
            const sp = filtersToSearchParams({ ...EMPTY_FILTERS, ...p.filters });
            navigate(`/search?${sp.toString()}`);
          }}
        >
          {p.label}
        </Chip>
      ))}
    </div>
  );
}
