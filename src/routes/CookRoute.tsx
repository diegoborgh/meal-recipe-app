import { useParams } from 'react-router-dom';

/** "/recipe/:id/cook" — Cook Mode B. Lands in slice 4. The protected anchor. */
export function CookRoute() {
  const { id } = useParams<{ id: string }>();
  return (
    <section style={{ padding: 32 }}>
      <h1 className="t-display-xl">Cook Mode</h1>
      <p style={{ color: 'var(--color-ink-soft)', fontSize: 16 }}>
        Recipe {id} · slice 4 placeholder.
      </p>
    </section>
  );
}
