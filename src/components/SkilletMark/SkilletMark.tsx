export interface SkilletMarkProps {
  size?: number;
  /** Defaults to var(--color-accent). Pass an explicit color to override. */
  color?: string;
}

/**
 * The Skillet logo glyph: a filled disc with a handle stub. Two faint highlights
 * suggest oil shine. Stays simple at 24px and scales cleanly to 220px (app icon).
 */
export function SkilletMark({ size = 32, color = 'var(--color-accent)' }: SkilletMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" aria-hidden="true">
      <circle cx="17" cy="20" r="11" fill={color} />
      <path d="M28 20 L34 20" stroke={color} strokeWidth={3} strokeLinecap="round" />
      <circle cx="14" cy="17" r="1.4" fill="#fff" opacity="0.7" />
      <circle cx="20" cy="22" r="1" fill="#fff" opacity="0.5" />
    </svg>
  );
}
