import { SkilletWordmark } from '@/components/SkilletWordmark';

/** "/" — Cook tab landing. Replaced in slice 2 (search) with the real Home. */
export function HomeRoute() {
  return (
    <section style={{ padding: '24px 20px' }}>
      <SkilletWordmark size={28} />
      <h1
        className="t-display-lg"
        style={{ marginTop: 24, marginBottom: 8 }}
      >
        Come into the <em style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>kitchen</em>.
      </h1>
      <p className="t-body" style={{ color: 'var(--color-ink-soft)' }}>
        Scaffold ready. Search lands in slice 2.
      </p>
    </section>
  );
}
