import type { CSSProperties, JSX } from 'react';

/**
 * Icon set ported from docs/design-handoff/project/components.jsx.
 * 24x24 viewBox, currentColor stroke, minimal stroke set.
 *
 * Adding a new icon: define the path nodes here; do not introduce a separate
 * icon library. The set is intentionally hand-curated to match the design.
 */

export type IconName =
  | 'search'
  | 'heart'
  | 'heart-fill'
  | 'home'
  | 'fridge'
  | 'settings'
  | 'bookmark'
  | 'clock'
  | 'chevron'
  | 'chevronDown'
  | 'plus'
  | 'minus'
  | 'close'
  | 'arrow'
  | 'arrowL'
  | 'filter'
  | 'grid'
  | 'list'
  | 'flame'
  | 'leaf'
  | 'wifi'
  | 'wifiOff'
  | 'sparkle'
  | 'chef'
  | 'upload'
  | 'trash'
  | 'moon'
  | 'sun'
  | 'info'
  | 'check'
  | 'undo'
  | 'star'
  | 'eye'
  | 'edit'
  | 'timer'
  | 'forks'
  | 'fire';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
  /** Decorative icons should keep the default; meaningful icons need a label. */
  'aria-label'?: string;
}

const paths: Record<IconName, JSX.Element> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  heart: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />,
  'heart-fill': (
    <path
      d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
      fill="currentColor"
      stroke="none"
    />
  ),
  home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />,
  fridge: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M6 10h12" />
      <path d="M9 6.5v1.5" />
      <path d="M9 13v3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05 4.93 4.93" />
    </>
  ),
  bookmark: <path d="M6 4h12v18l-6-4-6 4z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  close: (
    <>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  arrowL: (
    <>
      <path d="M19 12H5" />
      <path d="m11 19-7-7 7-7" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18" />
      <path d="M6 12h12" />
      <path d="M10 19h4" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  list: (
    <>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </>
  ),
  flame: (
    <>
      <path d="M12 3c0 4 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-5" />
      <path d="M12 12c2 0 3 1 3 3a3 3 0 0 1-6 0" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c8 0 14-6 14-14-7 0-13 5-14 12" />
      <path d="M5 19l7-7" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12a10 10 0 0 1 14 0" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </>
  ),
  wifiOff: (
    <>
      <path d="M5 12a10 10 0 0 1 14 0" />
      <path d="M8.5 15.5a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
      <path d="m3 3 18 18" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </>
  ),
  chef: (
    <>
      <path d="M7 14a4 4 0 0 1 0-8 4 4 0 0 1 7-1 4 4 0 0 1 4 9" />
      <path d="M7 14h11v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 17V5" />
      <path d="m6 11 6-6 6 6" />
      <path d="M5 19h14" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
    </>
  ),
  moon: <path d="M21 13a9 9 0 1 1-9-10 7 7 0 0 0 9 10z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01" />
      <path d="M12 11v5" />
    </>
  ),
  check: <path d="m5 13 4 4L19 7" />,
  undo: (
    <>
      <path d="M9 14H4V9" />
      <path d="M4 14a8 8 0 1 1 3-6" />
    </>
  ),
  star: <path d="m12 3 2.7 6 6.3.8-4.7 4.4 1.3 6.2L12 17.6 6.4 20.4l1.3-6.2L3 9.8l6.3-.8z" />,
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4l11-11-4-4L4 16z" />
      <path d="m13 5 4 4" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M9 1h6" />
      <path d="M12 13l3-3" />
    </>
  ),
  forks: (
    <>
      <path d="M5 3v18" />
      <path d="M5 12h6" />
      <path d="M11 3v9a3 3 0 0 1-3 3" />
      <path d="M19 3l-2 9 2 1v8" />
    </>
  ),
  fire: <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5 1 1 2 1 2 0 0-2-1-3 2-5z" />,
};

export function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.8,
  style,
  'aria-label': ariaLabel,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {paths[name]}
    </svg>
  );
}
