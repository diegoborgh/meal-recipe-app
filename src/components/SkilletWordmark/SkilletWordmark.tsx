import { SkilletMark } from '../SkilletMark';
import styles from './SkilletWordmark.module.css';

export interface SkilletWordmarkProps {
  /** Word size in px. Mark scales 1.55× for visual balance. */
  size?: number;
  /** Override mark color. Defaults to accent. */
  color?: string;
}

export function SkilletWordmark({ size = 22, color }: SkilletWordmarkProps) {
  return (
    <span
      className={styles.wordmark}
      style={{ fontSize: size, gap: size * 0.32 }}
    >
      <SkilletMark size={size * 1.55} color={color ?? 'var(--color-accent)'} />
      <span>Skillet</span>
    </span>
  );
}
