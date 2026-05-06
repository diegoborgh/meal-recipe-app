// Desktop screens — 1280x820, browser-window framed.
// Two-column layout: persistent left sidebar nav + main content.

const D_W = 1280;
const D_H = 820;

const DesktopShell = ({ active, children }) => {
  const t = T();
  return (
    <div style={{
      width: D_W, height: D_H, background: t.bg, display: 'flex',
      fontFamily: t.body, color: t.ink, overflow: 'hidden',
    }}>
      <DesktopSidebar active={active} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

const DesktopSidebar = ({ active }) => {
  const t = T();
  const items = [
    { id: 'home', label: 'Cook', icon: 'home' },
    { id: 'fridge', label: 'My fridge', icon: 'fridge' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
  ];
  return (
    <div style={{
      width: 240, background: t.surfaceAlt, borderRight: `1px solid ${t.line}`,
      padding: '28px 18px', display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
    }}>
      <div style={{ padding: '0 10px 22px' }}>
        <SkilletWordmark size={22} />
      </div>
      {items.map((it) => {
        const on = active === it.id;
        return (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
            borderRadius: t.r12, cursor: 'pointer',
            background: on ? t.surface : 'transparent',
            color: on ? t.ink : t.inkSoft,
            fontWeight: on ? 600 : 500,
            boxShadow: on ? t.shadowSm : 'none',
          }}>
            <Icon name={it.icon} size={20} color={on ? t.accent : t.inkSoft} />
            <span style={{ fontSize: 14 }}>{it.label}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 'auto', padding: '0 10px' }}>
        <div style={{ height: 1, background: t.line, marginBottom: 12 }} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', cursor: 'pointer',
          color: active === 'settings' ? t.ink : t.inkSoft,
        }}>
          <Icon name="settings" size={18} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Preferences</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Desktop · Home / Search
// ─────────────────────────────────────────────────────────────
function D_Home() {
  const t = T();
  const recipes = window.SkilletRecipes;
  return (
    <DesktopShell active="home">
      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase', color: t.accent, marginBottom: 8 }}>Tuesday · 6:42 pm</div>
            <div style={{ fontFamily: t.display, fontSize: 56, fontWeight: 500, letterSpacing: -1.4, lineHeight: 1.04 }}>
              Come into the <em style={{ color: t.accent, fontStyle: 'italic' }}>kitchen</em>.
            </div>
            <div style={{ color: t.inkSoft, fontSize: 16, marginTop: 8 }}>
              What sounds good tonight?
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <SearchInput placeholder="Search 'quick dinner', 'salmon', 'pasta'…" size="lg" style={{ flex: 1 }} />
          <Button variant="outline" size="lg" leadIcon="filter">Filters</Button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 32, flexWrap: 'wrap' }}>
          {['Under 30 min', 'Vegetarian', 'High-protein', 'Dinner', 'Weeknight', 'One pan'].map(c => <Chip key={c}>{c}</Chip>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontFamily: t.display, fontSize: 24, fontWeight: 600, letterSpacing: -0.3 }}>Tonight's picks</div>
          <span style={{ fontSize: 13, color: t.accent, fontWeight: 600, cursor: 'pointer' }}>See all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {recipes.slice(0, 4).map((r) => <RecipeCard key={r.id} {...r} />)}
        </div>
      </div>
    </DesktopShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Search results — sidebar filter + grid
// ─────────────────────────────────────────────────────────────
function D_Results() {
  const t = T();
  const recipes = window.SkilletRecipes;
  return (
    <DesktopShell active="home">
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Filter sidebar */}
        <div style={{ width: 280, padding: '32px 28px', borderRight: `1px solid ${t.line}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 22, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: t.display, fontSize: 20, fontWeight: 600 }}>Filters</div>
            <span style={{ fontSize: 12, color: t.accent, fontWeight: 600, cursor: 'pointer' }}>Reset</span>
          </div>
          <FilterGroup label="Diet">
            {['Any', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'GF'].map((d, i) => <Chip key={d} active={i === 1}>{d}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Avoid">
            {['Dairy', 'Gluten', 'Peanut', 'Tree nut', 'Egg', 'Shellfish'].map((d, i) => <Chip key={d} active={i === 0}>{d}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Time">
            {['15 min', '30 min', '60 min', 'Any'].map((d, i) => <Chip key={d} active={i === 1}>{d}</Chip>)}
          </FilterGroup>
          <FilterGroup label="Meal type">
            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((d, i) => <Chip key={d} active={i === 2}>{d}</Chip>)}
          </FilterGroup>
          <div>
            <FilterLabel>Calories</FilterLabel>
            <CalorieSlider />
          </div>
        </div>
        {/* Results */}
        <div style={{ flex: 1, padding: '32px 40px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
            <SearchInput value="quick dinner" placeholder="" style={{ flex: 1 }} />
            <Button variant="outline" leadIcon="filter">Sort: Best match</Button>
          </div>
          <div style={{ fontSize: 13, color: t.inkSoft, marginBottom: 18 }}>
            <strong style={{ color: t.ink, fontWeight: 600 }}>24 recipes</strong> match your filters
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {recipes.slice(0, 6).map((r) => <RecipeCard key={r.id} {...r} />)}
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Recipe Detail
// ─────────────────────────────────────────────────────────────
function D_Detail() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <DesktopShell active="home">
      <div style={{ flex: 1, overflow: 'hidden', padding: '32px 56px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontSize: 13, color: t.inkSoft }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <Icon name="arrowL" size={14} /> Back to results
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, flex: 1, overflow: 'hidden' }}>
          {/* Left — hero + ingredients */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, overflow: 'hidden' }}>
            <div style={{ position: 'relative', borderRadius: t.r16, overflow: 'hidden', aspectRatio: '16/10', flexShrink: 0 }}>
              <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button style={{
                position: 'absolute', top: 14, right: 14, width: 44, height: 44, borderRadius: 999,
                background: 'rgba(255,254,250,0.95)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm,
              }}>
                <Icon name="heart" size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: t.display, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>Ingredients</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: t.inkSoft }}>You have <strong style={{ color: t.accent2 }}>6 of 10</strong></span>
                <ServingsAdjuster servings={r.servings} />
                <UnitToggle />
              </div>
            </div>
            <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, overflow: 'hidden' }}>
              {r.ingredients.slice(0, 6).map((ing, i) => (
                <IngredientRow key={i} {...ing} divider={i > 0} />
              ))}
            </div>
          </div>

          {/* Right — title, stats, instructions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' }}>
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {r.badges.map((b, i) => <DietBadge key={i} tone={b.tone}>{b.label}</DietBadge>)}
              </div>
              <div style={{ fontFamily: t.display, fontSize: 36, fontWeight: 500, letterSpacing: -0.6, lineHeight: 1.08, textWrap: 'pretty' }}>{r.title}</div>
              <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 8, fontStyle: 'italic' }}>{r.attribution}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, padding: '14px 0' }}>
              <Stat label="Time" value={r.time} />
              <Stat label="Servings" value={r.servings} divider />
              <Stat label="Per serving" value={`${r.calories} kcal`} divider />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <MacroPill label="Protein" value={`${r.protein}g`} pct={0.45} color={t.accent} />
              <MacroPill label="Carbs" value={`${r.carbs}g`} pct={0.32} color={t.honey} />
              <MacroPill label="Fat" value={`${r.fat}g`} pct={0.23} color={t.accent2} />
            </div>
            <div style={{ fontFamily: t.display, fontSize: 22, fontWeight: 600, letterSpacing: -0.3, marginTop: 4 }}>How to make it</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
              {r.steps.slice(0, 3).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 999, background: t.bgDeep, color: t.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: t.display, fontSize: 15, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, color: t.ink, paddingTop: 4 }}>{s}</div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" trailIcon="arrow" full style={{ marginTop: 'auto' }}>Start cooking</Button>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Cook Mode (uses variant B — kitchen display, the recommended)
// ─────────────────────────────────────────────────────────────
function D_Cook() {
  const t = T();
  const r = window.SkilletDetailRecipe;
  return (
    <div style={{
      width: D_W, height: D_H, background: t.ink, color: '#fff',
      fontFamily: t.body, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '28px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ width: 48, height: 48, borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} color="#fff" />
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {r.steps.map((_, i) => (
            <div key={i} style={{ width: i === 1 ? 56 : 12, height: 8, borderRadius: 4, background: i <= 1 ? t.honey : 'rgba(255,255,255,0.18)' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ height: 48, padding: '0 18px', borderRadius: t.rPill, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
            <Icon name="forks" size={16} color="#fff" /> Ingredients
          </button>
        </div>
      </div>
      <div style={{ flex: 1, padding: '0 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: t.display, fontSize: 200, fontWeight: 600, lineHeight: 0.85, letterSpacing: -6, color: t.honey, fontVariantNumeric: 'tabular-nums' }}>02</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 600, marginTop: 8 }}>of {r.steps.length} · {r.title}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ fontFamily: t.display, fontSize: 36, lineHeight: 1.25, fontWeight: 500, letterSpacing: -0.4, textWrap: 'pretty' }}>
            {r.steps[1]}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: t.r12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Icon name="timer" size={22} color={t.honey} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>Optional · oven timer</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Salmon flakes easily and tomatoes burst.</div>
            </div>
            <button style={{ background: t.honey, color: t.ink, border: 'none', height: 44, padding: '0 20px', borderRadius: t.rPill, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Start 12:00</button>
          </div>
        </div>
      </div>
      <div style={{ padding: '28px 80px 36px', display: 'flex', gap: 14, justifyContent: 'flex-end' }}>
        <button style={{ height: 64, padding: '0 28px', borderRadius: t.rPill, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 600 }}>
          <Icon name="arrowL" size={20} color="#fff" /> Back
        </button>
        <button style={{ height: 64, padding: '0 36px', borderRadius: t.rPill, background: t.accent, border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700 }}>
          Next step <Icon name="arrow" size={22} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Favorites
// ─────────────────────────────────────────────────────────────
function D_Favorites() {
  const t = T();
  const recipes = window.SkilletRecipes.slice(0, 8);
  return (
    <DesktopShell active="saved">
      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 56px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: t.display, fontSize: 44, fontWeight: 500, letterSpacing: -1, lineHeight: 1 }}>
              Your <em style={{ color: t.accent, fontStyle: 'italic' }}>cookbook</em>
            </div>
            <div style={{ color: t.inkSoft, fontSize: 14, marginTop: 6 }}>23 saved recipes · always available offline</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <SearchInput placeholder="Search saved…" size="md" style={{ width: 260 }} />
            <div style={{ display: 'flex', background: t.bgDeep, borderRadius: t.rPill, padding: 3 }}>
              <button style={{ width: 38, height: 38, background: t.surface, border: 'none', borderRadius: t.rPill, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm }}>
                <Icon name="grid" size={16} />
              </button>
              <button style={{ width: 38, height: 38, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.inkSoft }}>
                <Icon name="list" size={16} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          <Chip active>All · 23</Chip>
          <Chip>Quick · 8</Chip>
          <Chip>Vegetarian · 12</Chip>
          <Chip>Dinners · 14</Chip>
          <Chip>Breakfasts · 4</Chip>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {recipes.map((r) => <RecipeCard key={r.id} {...r} saved />)}
        </div>
      </div>
    </DesktopShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Fridge
// ─────────────────────────────────────────────────────────────
function D_Fridge() {
  const t = T();
  const matches = [
    { ...window.SkilletRecipes[1], have: 5, need: 1 },
    { ...window.SkilletRecipes[5], have: 4, need: 2 },
    { ...window.SkilletRecipes[6], have: 4, need: 1 },
    { ...window.SkilletRecipes[2], have: 3, need: 3 },
  ];
  return (
    <DesktopShell active="fridge">
      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 56px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: t.display, fontSize: 44, fontWeight: 500, letterSpacing: -1, lineHeight: 1 }}>
            What's in your <em style={{ color: t.accent2, fontStyle: 'italic' }}>fridge</em>?
          </div>
          <div style={{ color: t.inkSoft, fontSize: 14, marginTop: 6 }}>
            Add what you've got — we'll find recipes that use as many as possible.
          </div>
        </div>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12,
          padding: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 28,
        }}>
          {window.SkilletFridge.map(i => (
            <Chip key={i} active onRemove={() => {}} style={{ background: '#EEF0DC', color: '#4F5A2E', borderColor: '#D9E0BA' }}>
              {i}
            </Chip>
          ))}
          <Chip leadIcon="plus" style={{ background: 'transparent', borderStyle: 'dashed' }}>Add ingredient</Chip>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <div style={{ fontFamily: t.display, fontSize: 22, fontWeight: 600, letterSpacing: -0.3 }}>14 recipes from your fridge</div>
          <span style={{ fontSize: 12, color: t.accent2, fontWeight: 600 }}>Most matches first</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {matches.map((r) => (
            <div key={r.id} style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: t.r12, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 8, left: 8, background: '#fff', padding: '5px 10px',
                  borderRadius: t.rPill, fontSize: 11, fontWeight: 700, color: t.accent2,
                  display: 'flex', alignItems: 'center', gap: 4, boxShadow: t.shadowSm,
                }}>
                  <Icon name="check" size={11} strokeWidth={2.8} /> {r.have} have · {r.need} need
                </div>
              </div>
              <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontFamily: t.display, fontSize: 16, fontWeight: 600, letterSpacing: -0.2, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 39 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: t.inkSoft }}>{r.time} · {r.calories}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop · Preferences
// ─────────────────────────────────────────────────────────────
function D_Preferences() {
  const t = T();
  return (
    <DesktopShell active="settings">
      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 80px', maxWidth: 760 }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: t.display, fontSize: 44, fontWeight: 500, letterSpacing: -1, lineHeight: 1 }}>
            Make it <em style={{ color: t.accent, fontStyle: 'italic' }}>yours</em>
          </div>
          <div style={{ color: t.inkSoft, fontSize: 14, marginTop: 6 }}>
            Saves automatically. Applies to every search.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <PrefRow label="Diet" hint="Single — applied to searches">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Any', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'GF'].map((d, i) => <Chip key={d} active={i === 1}>{d}</Chip>)}
            </div>
          </PrefRow>
          <PrefRow label="Avoid" hint="Hard filter — never shown">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['Dairy', 'Gluten', 'Peanut', 'Tree nut', 'Egg', 'Shellfish', 'Soy'].map((d, i) => <Chip key={d} active={i === 0 || i === 3}>{d}</Chip>)}
            </div>
          </PrefRow>
          <PrefRow label="Daily calorie goal" hint="Highlights recipes that fit">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 360 }}>
              <div style={{ flex: 1, position: 'relative', height: 24 }}>
                <div style={{ position: 'absolute', top: 11, left: 0, right: 0, height: 3, background: t.line, borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 11, left: 0, width: '55%', height: 3, background: t.accent, borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 4, left: '55%', marginLeft: -8, width: 17, height: 17, borderRadius: 999, background: '#fff', border: `2px solid ${t.accent}`, boxShadow: t.shadowSm }} />
              </div>
              <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 14, fontWeight: 600 }}>2,100 kcal</span>
            </div>
          </PrefRow>
          <PrefRow label="Units"><ToggleRow options={['US', 'Metric']} active={0} /></PrefRow>
          <PrefRow label="Theme">
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ icon: 'sun', label: 'Light' }, { icon: 'moon', label: 'Dark' }, { icon: 'settings', label: 'System' }].map((o, i) => (
                <div key={o.label} style={{
                  height: 44, padding: '0 18px', borderRadius: t.rPill,
                  border: `1px solid ${i === 0 ? t.accent : t.line}`,
                  background: i === 0 ? t.accent : t.surface,
                  color: i === 0 ? '#fff' : t.ink,
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  <Icon name={o.icon} size={14} /> {o.label}
                </div>
              ))}
            </div>
          </PrefRow>
          <PrefRow label="Your data">
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" leadIcon="upload">Export JSON</Button>
              <Button variant="ghost" leadIcon="trash" style={{ color: t.danger }}>Clear all data…</Button>
            </div>
          </PrefRow>
        </div>
      </div>
    </DesktopShell>
  );
}

const PrefRow = ({ label, hint, children }) => {
  const t = T();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 28, alignItems: 'flex-start', paddingBottom: 22, borderBottom: `1px solid ${t.line}` }}>
      <div>
        <div style={{ fontFamily: t.display, fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 4 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

Object.assign(window, {
  D_Home, D_Results, D_Detail, D_Cook, D_Favorites, D_Fridge, D_Preferences,
  D_W, D_H,
});
