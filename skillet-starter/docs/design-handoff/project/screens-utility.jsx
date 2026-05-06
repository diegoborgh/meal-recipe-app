// Utility screens — Offline indicator, Loading skeletons, Error state, App icon + splash.

// ─────────────────────────────────────────────────────────────
// Offline state — shown on Favorites when network drops
// ─────────────────────────────────────────────────────────────
function M_Offline() {
  const t = T();
  const recipes = window.SkilletRecipes.slice(0, 4);
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ fontFamily: t.display, fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>
          Your <em style={{ color: t.accent, fontStyle: 'italic' }}>cookbook</em>
        </div>
        <div style={{
          marginTop: 14, padding: '12px 14px', background: '#FBF1DE', border: '1px solid #F1DDB0',
          borderRadius: t.r12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Icon name="wifiOff" size={18} color="#7A571A" />
          <div style={{ fontSize: 13, color: '#5A4422', flex: 1 }}>
            <strong style={{ fontWeight: 700 }}>You're offline.</strong> Showing your saved recipes — you can still cook.
          </div>
        </div>
      </div>
      <div style={{ padding: '0 22px 16px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {recipes.map((r) => <RecipeCard key={r.id} {...r} saved />)}
        </div>
      </div>
      <MobileNav active="saved" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading state — skeleton cards
// ─────────────────────────────────────────────────────────────
function M_Loading() {
  const t = T();
  return (
    <PhoneShell>
      <style>{`
        @keyframes skl { 0%,100%{opacity:0.6} 50%{opacity:0.95} }
        .skl{animation:skl 1.4s ease-in-out infinite;background:${t.bgDeep}}
      `}</style>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <SkilletWordmark size={20} />
        </div>
        <div className="skl" style={{ height: 38, width: '70%', borderRadius: 8, marginBottom: 8 }} />
        <div className="skl" style={{ height: 38, width: '50%', borderRadius: 8, marginBottom: 18 }} />
        <div className="skl" style={{ height: 48, borderRadius: 999, marginBottom: 12 }} />
      </div>
      <div style={{ padding: '0 22px 16px', flex: 1 }}>
        <div className="skl" style={{ height: 18, width: 130, borderRadius: 6, marginBottom: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ background: t.surface, borderRadius: t.r12, overflow: 'hidden' }}>
              <div className="skl" style={{ aspectRatio: '4/3' }} />
              <div style={{ padding: 12 }}>
                <div className="skl" style={{ height: 14, borderRadius: 4, marginBottom: 6 }} />
                <div className="skl" style={{ height: 14, width: '70%', borderRadius: 4, marginBottom: 8 }} />
                <div className="skl" style={{ height: 10, width: '50%', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav active="home" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// Error / API quota state — calm, not alarming
// ─────────────────────────────────────────────────────────────
function M_Error() {
  const t = T();
  return (
    <PhoneShell>
      <StatusBar />
      <div style={{ padding: '8px 22px 14px' }}>
        <SkilletWordmark size={20} />
      </div>
      <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 16 }}>
        <div style={{ width: 110, height: 110, borderRadius: 999, background: '#FBF1DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="info" size={48} color="#C97A1F" strokeWidth={1.6} />
        </div>
        <div style={{ fontFamily: t.display, fontSize: 26, fontWeight: 500, lineHeight: 1.1, letterSpacing: -0.4 }}>
          The kitchen's <em style={{ color: t.accent, fontStyle: 'italic' }}>resting</em>.
        </div>
        <div style={{ fontSize: 14, color: t.inkSoft, lineHeight: 1.55, maxWidth: 280 }}>
          We've used today's recipe lookups. New search results will be back tomorrow — your saved recipes still work.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginTop: 10 }}>
          <Button variant="primary" leadIcon="bookmark" full>Open your cookbook</Button>
          <Button variant="ghost" full>Try again later</Button>
        </div>
      </div>
      <MobileNav active="home" />
      <HomeIndicator />
    </PhoneShell>
  );
}

// ─────────────────────────────────────────────────────────────
// App icon + splash + favicon
// ─────────────────────────────────────────────────────────────
function AppIcon({ size = 220 }) {
  const t = T();
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.22, overflow: 'hidden',
      background: `linear-gradient(160deg, ${t.bg} 0%, ${t.bgDeep} 100%)`,
      boxShadow: t.shadowMd, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 36 36">
        <circle cx="17" cy="20" r="11" fill={t.accent} />
        <path d="M28 20 L34 20" stroke={t.accent} strokeWidth="3.4" strokeLinecap="round" />
        <circle cx="13.5" cy="17" r="1.8" fill="#fff" opacity="0.85" />
        <circle cx="20" cy="22" r="1.2" fill="#fff" opacity="0.55" />
        <circle cx="17" cy="14" r="1" fill={t.honey} />
      </svg>
    </div>
  );
}

function Splash() {
  const t = T();
  return (
    <PhoneShell>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <AppIcon size={140} />
        <SkilletWordmark size={28} />
        <div style={{ color: t.inkSoft, fontSize: 13, fontStyle: 'italic', marginTop: -4 }}>Come into the kitchen.</div>
      </div>
      <div style={{ paddingBottom: 60, textAlign: 'center', fontSize: 11, color: t.inkMuted, letterSpacing: 0.4 }}>
        Local-first · works offline
      </div>
      <HomeIndicator />
    </PhoneShell>
  );
}

function IconShowcase() {
  const t = T();
  return (
    <div style={{ width: 600, height: 360, background: t.bg, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36 }}>
      <AppIcon size={220} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <AppIcon size={120} />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <AppIcon size={64} />
          <AppIcon size={40} />
          <AppIcon size={28} />
        </div>
        <div style={{ fontFamily: t.body, fontSize: 11, color: t.inkSoft, letterSpacing: 0.4, fontStyle: 'italic' }}>
          home screen · launcher · favicon
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { M_Offline, M_Loading, M_Error, AppIcon, Splash, IconShowcase });
