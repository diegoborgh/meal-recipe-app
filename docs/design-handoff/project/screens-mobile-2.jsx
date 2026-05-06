// Mobile screens · part 2 — Recipe detail (browse), Cook Mode (3 variants),
// Favorites (populated/empty), Fridge (empty/results), Preferences.

const M_Wm = 390;
const M_Hm = 780;

// ─────────────────────────────────────────────────────────────
// Mobile · Recipe Detail (Browse Mode)
// ─────────────────────────────────────────────────────────────
function M_Detail() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <PhoneShell>
      {/* Hero — bleeds under status bar */}
      <div style={{ position: 'relative', height: 320, flexShrink: 0, background: t.bgDeep }}>
        <img src={r.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(40,30,20,0.35) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.15) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <StatusBar dark />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 22px' }}>
            <button style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,254,250,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(6px)' }}>
              <Icon name="arrowL" size={18} color={t.ink} />
            </button>
            <button style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(255,254,250,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="heart" size={18} color={t.ink} />
            </button>
          </div>
        </div>
      </div>

      {/* Sheet pulled up over hero */}
      <div style={{
        flex: 1, background: t.bg, marginTop: -28, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '20px 22px 100px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 16,
        position: 'relative', zIndex: 2,
      }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            {r.badges.map((b, i) => <DietBadge key={i} tone={b.tone}>{b.label}</DietBadge>)}
          </div>
          <div style={{ fontFamily: t.display, fontSize: 26, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.12, textWrap: 'pretty' }}>
            {r.title}
          </div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 6, fontStyle: 'italic' }}>{r.attribution}</div>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, padding: '12px 0',
        }}>
          <Stat label="Time" value={r.time} />
          <Stat label="Servings" value={r.servings} divider />
          <Stat label="Per serving" value={`${r.calories} kcal`} divider />
        </div>

        {/* Macros */}
        <div style={{ display: 'flex', gap: 8 }}>
          <MacroPill label="Protein" value={`${r.protein}g`} pct={0.45} color={t.accent} />
          <MacroPill label="Carbs" value={`${r.carbs}g`} pct={0.32} color={t.honey} />
          <MacroPill label="Fat" value={`${r.fat}g`} pct={0.23} color={t.accent2} />
        </div>

        {/* Ingredients header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ fontFamily: t.display, fontSize: 18, fontWeight: 600, letterSpacing: -0.2 }}>Ingredients</div>
          <ServingsAdjuster servings={r.servings} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: t.inkSoft }}>You have <strong style={{ color: t.accent2 }}>6 of 10</strong></span>
          <UnitToggle />
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, overflow: 'hidden' }}>
          {r.ingredients.slice(0, 4).map((ing, i) => (
            <IngredientRow key={i} {...ing} divider={i > 0} />
          ))}
        </div>

      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 22px 30px',
        background: 'linear-gradient(180deg, transparent, rgba(246,241,232,0.95) 30%, ' + t.bg + ' 60%)',
      }}>
        <Button variant="primary" size="lg" full trailIcon="arrow" style={{ height: 56, fontSize: 16, fontWeight: 700 }}>
          Start cooking
        </Button>
      </div>
      <HomeIndicator />
    </PhoneShell>
  );
}

const Stat = ({ label, value, divider }) => {
  const t = T();
  return (
    <div style={{
      textAlign: 'center', padding: '0 8px',
      borderLeft: divider ? `1px solid ${t.line}` : 'none',
    }}>
      <div style={{ fontSize: 10, color: t.inkSoft, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: t.display, fontSize: 17, fontWeight: 600, letterSpacing: -0.2, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
};

const MacroPill = ({ label, value, pct, color }) => {
  const t = T();
  return (
    <div style={{ flex: 1, background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: t.inkSoft, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: t.display, fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{value}</div>
      <div style={{ height: 3, background: t.bgDeep, borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: color }} />
      </div>
    </div>
  );
};

const ServingsAdjuster = ({ servings }) => {
  const t = T();
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.rPill, height: 32 }}>
      <button style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="minus" size={14} />
      </button>
      <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums', minWidth: 16, textAlign: 'center' }}>{servings}</span>
      <button style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
};

const UnitToggle = () => {
  const t = T();
  return (
    <div style={{ display: 'inline-flex', background: t.bgDeep, padding: 2, borderRadius: t.rPill, fontSize: 11, fontWeight: 600 }}>
      <span style={{ padding: '4px 10px', background: t.surface, color: t.ink, borderRadius: t.rPill, boxShadow: t.shadowSm }}>US</span>
      <span style={{ padding: '4px 10px', color: t.inkSoft }}>Metric</span>
    </div>
  );
};

const IngredientRow = ({ name, amount, unit, have, divider }) => {
  const t = T();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12,
      borderTop: divider ? `1px solid ${t.lineSoft}` : 'none',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: have ? t.accent2 : 'transparent',
        border: have ? 'none' : `1.5px solid ${t.line}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {have && <Icon name="check" size={13} color="#fff" strokeWidth={2.8} />}
      </div>
      <span style={{ flex: 1, fontSize: 14, color: have ? t.ink : t.inkSoft }}>{name}</span>
      <span style={{ fontSize: 13, color: t.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
        <strong style={{ color: t.ink, fontWeight: 600 }}>{amount}</strong> {unit}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Cook Mode — three variants for comparison
// ─────────────────────────────────────────────────────────────

// Variant A — Subtle: same theme, larger type, simpler layout
function M_CookA() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '6px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${t.line}` }}>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="close" size={18} />
        </button>
        <div style={{ fontFamily: t.display, fontSize: 13, fontWeight: 600, color: t.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
          Step <span style={{ color: t.ink }}>2</span> of {r.steps.length}
        </div>
        <button style={{ width: 40, height: 40, borderRadius: 999, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="forks" size={18} />
        </button>
      </div>
      <div style={{ height: 4, background: t.bgDeep, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: t.accent }} />
      </div>
      <div style={{ flex: 1, padding: '36px 32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontFamily: t.display, fontSize: 12, fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase', color: t.accent }}>Step 2</div>
        <div style={{ fontFamily: t.display, fontSize: 28, lineHeight: 1.25, fontWeight: 500, letterSpacing: -0.3, color: t.ink, textWrap: 'pretty' }}>
          {r.steps[1]}
        </div>
        <div style={{ marginTop: 'auto', background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 6 }}>You'll need</div>
          <div style={{ fontSize: 13, color: t.ink, lineHeight: 1.5 }}>
            chickpeas · cherry tomatoes · 2 tbsp olive oil · 4 garlic cloves
          </div>
        </div>
      </div>
      <div style={{ padding: '0 22px 30px', display: 'flex', gap: 10 }}>
        <Button variant="outline" size="xl" leadIcon="arrowL" style={{ flex: 1 }}>Back</Button>
        <Button variant="primary" size="xl" trailIcon="arrow" style={{ flex: 2 }}>Next step</Button>
      </div>
      <HomeIndicator />
    </PhoneShell>
  );
}

// Variant B — Distinct: high-contrast "kitchen display" — dark on cream
function M_CookB() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <PhoneShell bg={t.ink}>
      <StatusBar dark />
      <div style={{ padding: '6px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="close" size={20} color="#fff" />
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {r.steps.map((_, i) => (
            <div key={i} style={{
              width: i === 1 ? 28 : 8, height: 8, borderRadius: 4,
              background: i <= 1 ? t.honey : 'rgba(255,255,255,0.18)',
            }} />
          ))}
        </div>
        <button style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="forks" size={20} color="#fff" />
        </button>
      </div>
      <div style={{ flex: 1, padding: '40px 32px 24px', display: 'flex', flexDirection: 'column', gap: 28, color: '#fff' }}>
        <div style={{
          fontFamily: t.display, fontSize: 64, fontWeight: 600, lineHeight: 0.9,
          letterSpacing: -2, color: t.honey, fontVariantNumeric: 'tabular-nums',
        }}>02<span style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)' }}>/{r.steps.length}</span></div>
        <div style={{
          fontFamily: t.body, fontSize: 26, lineHeight: 1.32, fontWeight: 500,
          color: '#fff', letterSpacing: -0.2, textWrap: 'pretty',
        }}>
          {r.steps[1]}
        </div>
        <div style={{
          marginTop: 'auto', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: t.r12, padding: 16,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.honey, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="timer" size={13} /> Set a timer · 12 min
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            Salmon is done when it flakes easily and tomatoes have burst.
          </div>
        </div>
      </div>
      <div style={{ padding: '0 22px 30px', display: 'flex', gap: 10 }}>
        <button style={{ flex: 1, height: 72, borderRadius: t.rPill, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
          <Icon name="arrowL" size={20} color="#fff" /> Back
        </button>
        <button style={{ flex: 2, height: 72, borderRadius: t.rPill, background: t.accent, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
          Next <Icon name="arrow" size={22} color="#fff" />
        </button>
      </div>
      <HomeIndicator />
    </PhoneShell>
  );
}

// Variant C — Full takeover: edge-to-edge, photo backdrop, immersive
function M_CookC() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <PhoneShell bg="#1a0f0a">
      {/* Backdrop photo */}
      <img src={r.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.32, filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(26,15,10,0.6) 0%, rgba(26,15,10,0.85) 40%, rgba(26,15,10,0.95) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <StatusBar dark />
        <div style={{ padding: '4px 18px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="close" size={20} color="#fff" />
          </button>
          <div style={{ fontFamily: t.body, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Salmon · keep warm
          </div>
          <button style={{ width: 44, height: 44, borderRadius: 999, background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sun" size={20} color="#fff" />
          </button>
        </div>

        <div style={{ flex: 1, padding: '20px 26px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: t.display, fontSize: 84, fontWeight: 600, lineHeight: 0.85, color: t.honey, fontStyle: 'italic', letterSpacing: -3 }}>two</span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 600 }}>of five</span>
          </div>
          <div style={{ fontFamily: t.display, fontSize: 32, lineHeight: 1.18, letterSpacing: -0.5, fontWeight: 500, textWrap: 'pretty' }}>
            {r.steps[1]}
          </div>
        </div>

        <div style={{ padding: '20px 22px 30px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: t.r16,
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
          }}>
            <Icon name="timer" size={18} color={t.honey} />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1 }}>Optional timer</span>
            <button style={{ background: t.honey, color: t.ink, border: 'none', height: 36, padding: '0 16px', borderRadius: t.rPill, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Start 12:00</button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ width: 72, height: 72, borderRadius: 999, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrowL" size={26} color="#fff" />
            </button>
            <button style={{ flex: 1, height: 72, borderRadius: t.rPill, background: t.accent, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: t.display, fontSize: 22, fontWeight: 600, letterSpacing: -0.2 }}>
              Next step <Icon name="arrow" size={26} color="#fff" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        <HomeIndicator />
      </div>
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Favorites (populated)
// ─────────────────────────────────────────────────────────────
function M_Favorites() {
  const t = T();
  const recipes = window.SkilletRecipes.slice(0, 5);
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: t.display, fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>
            Your <em style={{ color: t.accent, fontStyle: 'italic' }}>cookbook</em>
          </div>
          <div style={{ display: 'flex', background: t.bgDeep, borderRadius: t.rPill, padding: 2 }}>
            <button style={{ width: 32, height: 32, background: t.surface, border: 'none', borderRadius: t.rPill, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm }}>
              <Icon name="grid" size={14} />
            </button>
            <button style={{ width: 32, height: 32, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.inkSoft }}>
              <Icon name="list" size={14} />
            </button>
          </div>
        </div>
        <SearchInput placeholder="Search your saved recipes…" size="sm" />
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          <Chip active>All · 23</Chip>
          <Chip>Quick · 8</Chip>
          <Chip>Vegetarian · 12</Chip>
        </div>
      </div>
      <div style={{ padding: '0 22px 16px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {recipes.map((r, i) => <RecipeCard key={r.id} {...r} saved />)}
        </div>
      </div>
      <MobileNav active="saved" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Favorites (empty state)
// ─────────────────────────────────────────────────────────────
function M_FavoritesEmpty() {
  const t = T();
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontFamily: t.display, fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>
          Your <em style={{ color: t.accent, fontStyle: 'italic' }}>cookbook</em>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 18 }}>
        <div style={{ width: 120, height: 120, borderRadius: 999, background: t.surface, border: `1px dashed ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="heart" size={48} color={t.accent} strokeWidth={1.4} />
        </div>
        <div style={{ fontFamily: t.display, fontSize: 24, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.3 }}>
          A blank page,<br/>waiting to be <em style={{ color: t.accent, fontStyle: 'italic' }}>filled</em>.
        </div>
        <div style={{ fontSize: 14, color: t.inkSoft, lineHeight: 1.55, maxWidth: 260 }}>
          Tap the heart on any recipe you want to come back to. Saved recipes work offline — perfect for the kitchen.
        </div>
        <Button variant="primary" size="md" leadIcon="search" style={{ marginTop: 4 }}>Find something to cook</Button>
      </div>
      <MobileNav active="saved" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Fridge (empty / onboarding)
// ─────────────────────────────────────────────────────────────
function M_FridgeEmpty() {
  const t = T();
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontFamily: t.display, fontSize: 30, fontWeight: 500, letterSpacing: -0.6, marginBottom: 4 }}>
          What's in your <em style={{ color: t.accent2, fontStyle: 'italic' }}>fridge</em>?
        </div>
        <div style={{ fontSize: 14, color: t.inkSoft, marginBottom: 16, lineHeight: 1.45 }}>
          Add a few things you've got. We'll find recipes that use as many as possible.
        </div>
        <div style={{
          background: t.surface, border: `1px dashed ${t.accent2}`, borderRadius: t.r12,
          padding: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Icon name="plus" size={18} color={t.accent2} strokeWidth={2.2} />
          <span style={{ flex: 1, color: t.inkSoft, fontSize: 14 }}>Type an ingredient — eggs, spinach, garlic…</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '6px 22px 14px', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.inkSoft }}>Common starters · tap to add</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['Eggs', 'Chicken', 'Pasta', 'Rice', 'Tomatoes', 'Spinach', 'Garlic', 'Onion', 'Cheese', 'Lemon'].map(i => (
            <Chip key={i} leadIcon="plus">{i}</Chip>
          ))}
        </div>

        <div style={{ marginTop: 8, padding: '20px 18px', background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: '#EEF0DC', color: t.accent2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="info" size={18} />
            </div>
            <div>
              <div style={{ fontFamily: t.display, fontSize: 16, fontWeight: 600, marginBottom: 4 }}>How this works</div>
              <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
                Add 4–6 ingredients you have. Recipes are ranked by how few extras you'd need to buy.
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileNav active="fridge" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Fridge results
// ─────────────────────────────────────────────────────────────
function M_FridgeResults() {
  const t = T();
  const matches = [
    { ...window.SkilletRecipes[1], have: 5, need: 1 },
    { ...window.SkilletRecipes[5], have: 4, need: 2 },
    { ...window.SkilletRecipes[6], have: 4, need: 1 },
  ];
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontFamily: t.display, fontSize: 24, fontWeight: 500, letterSpacing: -0.4, marginBottom: 12 }}>
          What's in your <em style={{ color: t.accent2, fontStyle: 'italic' }}>fridge</em>?
        </div>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12,
          padding: 12, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        }}>
          {window.SkilletFridge.map(i => (
            <Chip key={i} active onRemove={() => {}} style={{ background: '#EEF0DC', color: '#4F5A2E', borderColor: '#D9E0BA' }}>
              {i}
            </Chip>
          ))}
          <Chip leadIcon="plus" style={{ background: 'transparent', borderStyle: 'dashed' }}>Add</Chip>
        </div>
      </div>
      <div style={{ padding: '4px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 13, color: t.inkSoft }}>
          <strong style={{ color: t.ink, fontWeight: 600 }}>14 recipes</strong> from your fridge
        </div>
        <div style={{ fontSize: 11, color: t.accent2, fontWeight: 600 }}>Most matches first</div>
      </div>
      <div style={{ padding: '0 22px 16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {matches.map((r) => (
          <FridgeCard key={r.id} recipe={r} have={r.have} need={r.need} />
        ))}
      </div>
      <MobileNav active="fridge" />
      <HomeIndicator />
    </PhoneShell>
  );
}

const FridgeCard = ({ recipe, have, need }) => {
  const t = T();
  return (
    <div style={{
      display: 'flex', gap: 12, background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: t.r12, padding: 10, alignItems: 'center', cursor: 'pointer',
    }}>
      <img src={recipe.img} alt="" style={{ width: 84, height: 84, borderRadius: t.r8, objectFit: 'cover' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontFamily: t.display, fontSize: 15, fontWeight: 600, lineHeight: 1.18, letterSpacing: -0.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {recipe.title}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.accent2, fontWeight: 700 }}>
            <Icon name="check" size={11} strokeWidth={2.8} /> {have} have
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.inkSoft, fontWeight: 600 }}>
            <Icon name="plus" size={11} strokeWidth={2.4} /> {need} need
          </span>
        </div>
        <div style={{ fontSize: 11, color: t.inkSoft }}>{recipe.time} · {recipe.calories}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Mobile · Preferences / Settings
// ─────────────────────────────────────────────────────────────
function M_Preferences() {
  const t = T();
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 18px' }}>
        <div style={{ fontFamily: t.display, fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>
          Make it <em style={{ color: t.accent, fontStyle: 'italic' }}>yours</em>
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 4 }}>
          Saves automatically. Applies to every search.
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 22px 16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <PrefGroup label="Diet">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Any', 'Vegetarian', 'Vegan', 'Pescatarian'].map((d, i) => <Chip key={d} active={i === 1}>{d}</Chip>)}
          </div>
        </PrefGroup>
        <PrefGroup label="Avoid (always)">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Dairy', 'Gluten', 'Peanut', 'Tree nut'].map((d, i) => <Chip key={d} active={i === 0 || i === 3}>{d}</Chip>)}
          </div>
        </PrefGroup>
        <PrefGroup label="Daily calorie goal" hint="Optional · highlights recipes that fit">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, position: 'relative', height: 24 }}>
              <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 3, background: t.line, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 11, left: 0, width: '55%', height: 3, background: t.accent, borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 4, left: '55%', marginLeft: -8, width: 17, height: 17, borderRadius: 999, background: '#fff', border: `2px solid ${t.accent}`, boxShadow: t.shadowSm }} />
            </div>
            <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600 }}>2,100 kcal</span>
          </div>
        </PrefGroup>
        <PrefGroup label="Units">
          <ToggleRow options={['US', 'Metric']} active={0} />
        </PrefGroup>
        <PrefGroup label="Theme">
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ icon: 'sun', label: 'Light' }, { icon: 'moon', label: 'Dark' }, { icon: 'settings', label: 'System' }].map((o, i) => (
              <div key={o.label} style={{
                flex: 1, height: 44, borderRadius: t.rPill,
                border: `1px solid ${i === 0 ? t.accent : t.line}`,
                background: i === 0 ? t.accent : t.surface,
                color: i === 0 ? '#fff' : t.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                <Icon name={o.icon} size={14} /> {o.label}
              </div>
            ))}
          </div>
        </PrefGroup>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <Button variant="outline" leadIcon="upload" style={{ flex: 1 }}>Export</Button>
          <Button variant="ghost" leadIcon="trash" style={{ flex: 1, color: t.danger }}>Clear data</Button>
        </div>
      </div>
      <MobileNav active="settings" />
      <HomeIndicator />
    </PhoneShell>
  );
}

const PrefGroup = ({ label, hint, children }) => {
  const t = T();
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.inkSoft }}>{label}</span>
        {hint && <span style={{ fontSize: 11, color: t.inkMuted, fontStyle: 'italic' }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
};

const ToggleRow = ({ options, active }) => {
  const t = T();
  return (
    <div style={{ display: 'inline-flex', background: t.bgDeep, padding: 3, borderRadius: t.rPill }}>
      {options.map((o, i) => (
        <span key={o} style={{
          padding: '8px 18px', borderRadius: t.rPill,
          background: i === active ? t.surface : 'transparent',
          color: i === active ? t.ink : t.inkSoft,
          fontSize: 13, fontWeight: 600,
          boxShadow: i === active ? t.shadowSm : 'none',
        }}>{o}</span>
      ))}
    </div>
  );
};

Object.assign(window, {
  M_Detail, M_CookA, M_CookB, M_CookC,
  M_Favorites, M_FavoritesEmpty,
  M_FridgeEmpty, M_FridgeResults,
  M_Preferences,
});
