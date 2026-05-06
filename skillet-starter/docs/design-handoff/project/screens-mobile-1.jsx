// Mobile screens — phone-shaped, 390x780.
// Each screen is a complete frame with status bar, content, and (where applicable) bottom nav.
// All screens share the iOS-style status bar.

const M_W = 390;
const M_H = 780;

// ─────────────────────────────────────────────────────────────
// Status bar (lightweight, not the full IOSStatusBar — we want flat 0,0)
// ─────────────────────────────────────────────────────────────
const StatusBar = ({ dark, time = '6:42' }) => {
  const c = dark ? '#fff' : '#000';
  return (
    <div style={{
      height: 44, padding: '0 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', flexShrink: 0,
    }}>
      <span style={{ fontFamily: '-apple-system, system-ui', fontWeight: 600, fontSize: 15, color: c }}>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: c }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><path d="M8.5 2.7c2 0 3.7.8 5 2L14.5 4C13 2.6 10.9 1.7 8.5 1.7S4 2.6 2.5 4l1 .7c1.3-1.2 3-2 5-2zM8.5 5.7c1.3 0 2.4.5 3.2 1.3l1-.9C11.5 5 10.1 4.4 8.5 4.4S5.5 5 4.3 6.1l1 .9c.8-.8 1.9-1.3 3.2-1.3zM8.5 8.5a1.3 1.3 0 1 1 0 2.5 1.3 1.3 0 0 1 0-2.5z" fill={c}/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke={c} fill="none" opacity="0.4"/><rect x="2" y="2" width="15" height="7" rx="1.4" fill={c}/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.5" fill={c} opacity="0.4"/></svg>
      </div>
    </div>
  );
};

const HomeIndicator = () => <div style={{
  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
  width: 134, height: 5, borderRadius: 3, background: '#000', opacity: 0.85,
}} />;

const PhoneShell = ({ children, bg }) => {
  const t = T();
  return (
    <div style={{
      width: M_W, height: M_H, background: bg || t.bg,
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: t.body, color: t.ink, overflow: 'hidden',
    }}>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Mobile · Home / Search (default state)
// ─────────────────────────────────────────────────────────────
function M_Home() {
  const t = T();
  const recipes = window.SkilletRecipes;
  return (
    <PhoneShell>
      <StatusBar />
      {/* Header */}
      <div style={{ padding: '8px 22px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <SkilletWordmark size={20} />
          <button style={{
            width: 40, height: 40, borderRadius: 999, background: t.surface,
            border: `1px solid ${t.line}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="settings" size={18} color={t.inkSoft} />
          </button>
        </div>
        <div style={{
          fontFamily: t.display, fontSize: 32, lineHeight: 1.04,
          letterSpacing: -0.8, fontWeight: 500, marginBottom: 4,
        }}>
          Come into<br/>
          the <em style={{ color: t.accent, fontStyle: 'italic' }}>kitchen</em>.
        </div>
        <div style={{ color: t.inkSoft, fontSize: 14, marginBottom: 16 }}>
          Tuesday — what are we cooking?
        </div>
        <SearchInput placeholder="Try 'quick dinner', 'salmon', 'pasta'…" />
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflow: 'hidden' }}>
          {[
            { l: '15 min', i: 'clock', on: false },
            { l: 'Vegetarian', i: 'leaf', on: false },
            { l: 'Quick dinner', i: null, on: false },
            { l: 'High-protein', i: null, on: false },
          ].map((c, i) => (
            <Chip key={i} leadIcon={c.i}>{c.l}</Chip>
          ))}
        </div>
      </div>
      {/* Featured row */}
      <div style={{ padding: '4px 22px 12px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: t.display, fontSize: 18, fontWeight: 600, letterSpacing: -0.2 }}>
            Tonight's picks
          </div>
          <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>See all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {recipes.slice(0, 4).map((r) => (
            <RecipeCard key={r.id} {...r} />
          ))}
        </div>
      </div>
      <MobileNav active="home" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Search results (filters collapsed)
// ─────────────────────────────────────────────────────────────
function M_Results() {
  const t = T();
  const recipes = window.SkilletRecipes;
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 16px', borderBottom: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="arrowL" size={18} />
          </button>
          <SearchInput value="quick dinner" placeholder="" style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflow: 'hidden' }}>
          <Chip leadIcon="filter" active>3</Chip>
          <Chip active onRemove={() => {}}>Under 30 min</Chip>
          <Chip active onRemove={() => {}}>Vegetarian</Chip>
          <Chip active onRemove={() => {}}>Dinner</Chip>
        </div>
      </div>
      <div style={{ padding: '14px 22px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 13, color: t.inkSoft }}>
          <strong style={{ color: t.ink, fontWeight: 600 }}>24 recipes</strong> match your filters
        </div>
        <button style={{ background: 'none', border: 'none', color: t.accent, fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          Sort <Icon name="chevronDown" size={12} />
        </button>
      </div>
      <div style={{ padding: '0 22px 16px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {recipes.slice(0, 6).map((r) => (
            <RecipeCard key={r.id} {...r} />
          ))}
        </div>
      </div>
      <MobileNav active="home" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile · Filters open (modal sheet)
// ─────────────────────────────────────────────────────────────
function M_Filters() {
  const t = T();
  return (
    <PhoneShell bg="rgba(40,30,20,0.45)">
      {/* Dim home behind */}
      <div style={{
        position: 'absolute', inset: 0, background: t.bg, opacity: 0.4, pointerEvents: 'none',
      }} />
      {/* Sheet */}
      <div style={{
        marginTop: 'auto', background: t.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '12px 22px 28px', maxHeight: '88%', display: 'flex', flexDirection: 'column',
        boxShadow: t.shadowLg, position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: 40, height: 4, background: t.line, borderRadius: 4, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontFamily: t.display, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>Filters</div>
          <button style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset</button>
        </div>
        <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}>
          <FilterGroup label="Diet">
            {['Any', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Gluten-free'].map((d, i) => (
              <Chip key={d} active={i === 1}>{d}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Avoid (intolerances)">
            {['Dairy', 'Gluten', 'Peanut', 'Tree nut', 'Egg', 'Shellfish', 'Soy'].map((d, i) => (
              <Chip key={d} active={i === 0}>{d}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Max ready time">
            {['15 min', '30 min', '60 min', 'Any'].map((d, i) => (
              <Chip key={d} active={i === 1}>{d}</Chip>
            ))}
          </FilterGroup>
          <FilterGroup label="Meal type">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'].map((d, i) => (
              <Chip key={d} active={i === 2}>{d}</Chip>
            ))}
          </FilterGroup>
          <div>
            <FilterLabel>Calories per serving</FilterLabel>
            <CalorieSlider />
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
          <Button variant="outline" full>Cancel</Button>
          <Button variant="primary" full>Show 24 recipes</Button>
        </div>
      </div>
      <HomeIndicator />
    </PhoneShell>
  );
}

const FilterLabel = ({ children }) => {
  const t = T();
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: t.inkSoft, marginBottom: 10 }}>{children}</div>;
};
const FilterGroup = ({ label, children }) => (
  <div>
    <FilterLabel>{label}</FilterLabel>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{children}</div>
  </div>
);

const CalorieSlider = () => {
  const t = T();
  return (
    <div>
      <div style={{ position: 'relative', height: 36, padding: '0 6px' }}>
        <div style={{ position: 'absolute', top: 17, left: 6, right: 6, height: 3, background: t.line, borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 17, left: '20%', width: '50%', height: 3, background: t.accent, borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 10, left: '20%', width: 18, height: 18, marginLeft: -9, background: '#fff', border: `2px solid ${t.accent}`, borderRadius: 999, boxShadow: t.shadowSm }} />
        <div style={{ position: 'absolute', top: 10, left: '70%', width: 18, height: 18, marginLeft: -9, background: '#fff', border: `2px solid ${t.accent}`, borderRadius: 999, boxShadow: t.shadowSm }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: t.inkSoft, fontVariantNumeric: 'tabular-nums' }}>
        <span>200 kcal</span>
        <span style={{ color: t.ink, fontWeight: 600 }}>200 — 600 kcal</span>
        <span>1000 kcal</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Mobile · No results
// ─────────────────────────────────────────────────────────────
function M_NoResults() {
  const t = T();
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 16px', borderBottom: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button style={{ width: 40, height: 40, borderRadius: 999, background: t.surface, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="arrowL" size={18} />
          </button>
          <SearchInput value="vegan keto under 15 min" placeholder="" style={{ flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Chip active onRemove={() => {}}>Vegan</Chip>
          <Chip active onRemove={() => {}}>Keto</Chip>
          <Chip active onRemove={() => {}}>Under 15 min</Chip>
        </div>
      </div>
      <div style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14 }}>
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 4 }}>
          <SkilletMark size={96} color={t.honey} />
        </div>
        <div style={{ fontFamily: t.display, fontSize: 26, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.1 }}>
          Hmm, nothing's matching <em style={{ color: t.accent, fontStyle: 'italic' }}>all</em> of those.
        </div>
        <div style={{ fontSize: 14, color: t.inkSoft, lineHeight: 1.5, maxWidth: 280 }}>
          Vegan keto in under 15 minutes is a tough order. Want to loosen one of these?
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: 'stretch' }}>
          <SuggestionRow label="Drop the 15-min limit" hint="→ 18 recipes" />
          <SuggestionRow label="Drop 'Keto'" hint="→ 41 recipes" />
          <SuggestionRow label="Drop 'Vegan'" hint="→ 6 recipes" />
        </div>
      </div>
      <MobileNav active="home" />
      <HomeIndicator />
    </PhoneShell>
  );
}

const SuggestionRow = ({ label, hint }) => {
  const t = T();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: t.r12, cursor: 'pointer',
    }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>{hint}</span>
    </div>
  );
};

Object.assign(window, { M_Home, M_Results, M_Filters, M_NoResults, PhoneShell, StatusBar, HomeIndicator, M_W, M_H });
