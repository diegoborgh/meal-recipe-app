import styles from './InstructionsList.module.css';

export interface InstructionsListProps {
  steps: string[];
}

export function InstructionsList({ steps }: InstructionsListProps) {
  if (steps.length === 0) {
    return (
      <div className={styles.empty}>
        This recipe didn’t come with step-by-step instructions. The source link
        in the byline above should have the full method.
      </div>
    );
  }

  return (
    <ol className={styles.list}>
      {steps.map((s, i) => (
        <li key={i} className={styles.step}>
          <div className={styles.number} aria-hidden="true">
            {i + 1}
          </div>
          <div className={styles.body}>{s}</div>
        </li>
      ))}
    </ol>
  );
}
