// Mounts the full design canvas with all screens.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C0502B",
  "device": "both"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent live
  React.useEffect(() => {
    window.SkilletTokens.accent = tweaks.accent;
  }, [tweaks.accent]);

  const showMobile = tweaks.device !== 'desktop';
  const showDesktop = tweaks.device !== 'mobile';

  return (
    <>
      <DesignCanvas>
        <DCSection id="cover" title="Skillet · Meal Recipe PWA"
          subtitle='"Come into the kitchen." Warm earthy identity. Light theme · mobile + desktop. Pan/zoom; click expand to focus an artboard.'>
          <DCArtboard id="cover-card" label="Cover" width={760} height={460}>
            <CoverArtboard />
          </DCArtboard>
          <DCArtboard id="icon" label="App icon · favicon · splash" width={620} height={460}>
            <IconShowcase />
          </DCArtboard>
        </DCSection>

        {showMobile && (
          <DCSection id="m-discovery" title="Mobile · Discovery"
            subtitle="Home, search results, filter sheet, no-results.">
            <DCArtboard id="m-home" label="Home" width={M_W} height={M_H}><M_Home/></DCArtboard>
            <DCArtboard id="m-results" label="Results · filters collapsed" width={M_W} height={M_H}><M_Results/></DCArtboard>
            <DCArtboard id="m-filters" label="Filters · sheet open" width={M_W} height={M_H}><M_Filters/></DCArtboard>
            <DCArtboard id="m-noresults" label="No results · suggestions" width={M_W} height={M_H}><M_NoResults/></DCArtboard>
          </DCSection>
        )}

        {showMobile && (
          <DCSection id="m-recipe" title="Mobile · Recipe + Cook Mode"
            subtitle="Browse mode + three Cook Mode treatments to compare. The brief asks for 2–3 — these are A/B/C.">
            <DCArtboard id="m-detail" label="Recipe · Browse" width={M_W} height={M_H}><M_Detail/></DCArtboard>
            <DCArtboard id="m-cook-a" label="Cook · A · subtle, same theme" width={M_W} height={M_H}><M_CookA/></DCArtboard>
            <DCArtboard id="m-cook-b" label="Cook · B · kitchen display ★ recommended" width={M_W} height={M_H}><M_CookB/></DCArtboard>
            <DCArtboard id="m-cook-c" label="Cook · C · immersive backdrop" width={M_W} height={M_H}><M_CookC/></DCArtboard>
          </DCSection>
        )}

        {showMobile && (
          <DCSection id="m-saved-fridge" title="Mobile · Saved & Fridge"
            subtitle="Favorites + What's in My Fridge — both states.">
            <DCArtboard id="m-fav" label="Saved · populated" width={M_W} height={M_H}><M_Favorites/></DCArtboard>
            <DCArtboard id="m-fav-empty" label="Saved · empty" width={M_W} height={M_H}><M_FavoritesEmpty/></DCArtboard>
            <DCArtboard id="m-fridge-empty" label="Fridge · onboarding" width={M_W} height={M_H}><M_FridgeEmpty/></DCArtboard>
            <DCArtboard id="m-fridge-results" label="Fridge · results" width={M_W} height={M_H}><M_FridgeResults/></DCArtboard>
          </DCSection>
        )}

        {showMobile && (
          <DCSection id="m-utility" title="Mobile · States"
            subtitle="Preferences, offline, loading, error.">
            <DCArtboard id="m-prefs" label="Preferences" width={M_W} height={M_H}><M_Preferences/></DCArtboard>
            <DCArtboard id="m-offline" label="Offline indicator" width={M_W} height={M_H}><M_Offline/></DCArtboard>
            <DCArtboard id="m-loading" label="Loading skeleton" width={M_W} height={M_H}><M_Loading/></DCArtboard>
            <DCArtboard id="m-error" label="Error · API quota" width={M_W} height={M_H}><M_Error/></DCArtboard>
            <DCArtboard id="m-splash" label="Splash" width={M_W} height={M_H}><Splash/></DCArtboard>
          </DCSection>
        )}

        {showDesktop && (
          <DCSection id="d-main" title="Desktop · Primary screens"
            subtitle="1280×820. Persistent sidebar nav. Editorial layout reflows for the bigger canvas.">
            <DCArtboard id="d-home" label="Home" width={D_W} height={D_H}><D_Home/></DCArtboard>
            <DCArtboard id="d-results" label="Results · sidebar filters" width={D_W} height={D_H}><D_Results/></DCArtboard>
            <DCArtboard id="d-detail" label="Recipe · Browse" width={D_W} height={D_H}><D_Detail/></DCArtboard>
            <DCArtboard id="d-cook" label="Cook Mode · kitchen display" width={D_W} height={D_H}><D_Cook/></DCArtboard>
          </DCSection>
        )}

        {showDesktop && (
          <DCSection id="d-secondary" title="Desktop · Saved, Fridge, Preferences">
            <DCArtboard id="d-fav" label="Saved" width={D_W} height={D_H}><D_Favorites/></DCArtboard>
            <DCArtboard id="d-fridge" label="Fridge" width={D_W} height={D_H}><D_Fridge/></DCArtboard>
            <DCArtboard id="d-prefs" label="Preferences" width={D_W} height={D_H}><D_Preferences/></DCArtboard>
          </DCSection>
        )}

        <DCSection id="notes" title="Designer's notes & tokens"
          subtitle="Decisions, tradeoffs, and the token inventory for engineering handoff.">
          <DCArtboard id="notes-decisions" label="Key decisions" width={620} height={620}><DesignerNotes/></DCArtboard>
          <DCArtboard id="notes-tokens" label="Tokens" width={620} height={620}><TokensSheet/></DCArtboard>
          <DCArtboard id="notes-components" label="Component inventory" width={620} height={620}><ComponentsSheet/></DCArtboard>
        </DCSection>
      </DesignCanvas>

      <SkilletTweaks tweaks={tweaks} setTweak={setTweaks} />
    </>
  );
}

const SkilletTweaks = ({ tweaks, setTweak }) => {
  const swatches = ['#C0502B', '#9C3A1F', '#7A8951', '#3D5A2C', '#B8693D', '#E8B25C', '#5C7C3A'];
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Form factor">
        <TweakRadio
          options={[{value:'both',label:'Both'},{value:'mobile',label:'Mobile only'},{value:'desktop',label:'Desktop only'}]}
          value={tweaks.device}
          onChange={(v) => setTweak('device', v)} />
      </TweakSection>
      <TweakSection title="Accent color">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {swatches.map(c => (
            <button key={c} onClick={() => setTweak('accent', c)} style={{
              width: 28, height: 28, borderRadius: 999, background: c, cursor: 'pointer',
              border: tweaks.accent === c ? '2.5px solid #2A1F17' : '1.5px solid rgba(0,0,0,0.1)',
              padding: 0,
            }}/>
          ))}
        </div>
        <TweakColor value={tweaks.accent} onChange={(v) => setTweak('accent', v)} />
      </TweakSection>
    </TweaksPanel>
  );
};

const CoverArtboard = () => {
  const t = window.SkilletTokens;
  return (
    <div style={{
      width: '100%', height: '100%', background: t.surface, padding: 56,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      fontFamily: t.body, color: t.ink,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SkilletWordmark size={26} />
        <div style={{ textAlign: 'right', fontSize: 11, color: t.inkSoft, fontVariantNumeric: 'tabular-nums', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
          v1 · {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: t.display, fontSize: 64, fontWeight: 500, letterSpacing: -1.6, lineHeight: 1, marginBottom: 16 }}>
          Come into the<br/><em style={{ color: t.accent, fontStyle: 'italic' }}>kitchen</em>.
        </div>
        <div style={{ fontSize: 16, color: t.inkSoft, lineHeight: 1.55, maxWidth: 480 }}>
          A local-first recipe PWA for cooking healthier at home — without the clinical fitness vibe.
          14 screens · mobile + desktop · light theme.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid ${t.line}`, paddingTop: 18 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#C0502B', '#7A8951', '#E8B25C', '#F6F1E8', '#2A1F17'].map(c => (
            <div key={c} style={{ width: 28, height: 28, borderRadius: 6, background: c, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)' }} />
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.inkSoft, fontStyle: 'italic' }}>↓ scroll the canvas</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Notes / docs
// ─────────────────────────────────────────────────────────────
const NotesShell = ({ children }) => {
  const t = window.SkilletTokens;
  return (
    <div style={{
      width: '100%', height: '100%', padding: '34px 38px', overflow: 'hidden',
      background: t.surface, fontFamily: t.body, color: t.ink,
      display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box',
    }}>
      {children}
    </div>
  );
};

const NoteH = ({ children }) => {
  const t = window.SkilletTokens;
  return <div style={{ fontFamily: t.display, fontSize: 26, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.05 }}>{children}</div>;
};
const NoteSection = ({ label }) => {
  const t = window.SkilletTokens;
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: t.accent, marginTop: 6 }}>{label}</div>;
};
const NoteP = ({ children }) => {
  const t = window.SkilletTokens;
  return <div style={{ fontSize: 13, lineHeight: 1.55, color: t.ink }}>{children}</div>;
};
const NoteRow = ({ label, val }) => {
  const t = window.SkilletTokens;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${t.lineSoft}`, fontSize: 12 }}>
      <span style={{ color: t.inkSoft }}>{label}</span>
      <span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 11, color: t.ink, fontWeight: 600 }}>{val}</span>
    </div>
  );
};

function DesignerNotes() {
  return (
    <NotesShell>
      <NoteH>Designer's notes</NoteH>
      <NoteSection label="Name & tagline" />
      <NoteP><strong>Skillet</strong> — a single, tactile kitchen object. Concrete, warm, easy to remember. Tagline <em>"Come into the kitchen"</em> is an invitation, not a command. Pairs with the brand mark (a stylized cast-iron skillet).</NoteP>
      <NoteSection label="Navigation" />
      <NoteP>Mobile: bottom tab bar (Cook · Fridge · Saved · You). Desktop: persistent left sidebar. <strong>Fridge gets equal billing</strong> — it's the brief's signature differentiator and deserves a top-level slot.</NoteP>
      <NoteSection label="Health score" />
      <NoteP>Hidden. Health framing is carried by diet badges + nutrition stats. Avoids the awkward "73/100" that quietly judges users.</NoteP>
      <NoteSection label="Cook Mode (3 to compare)" />
      <NoteP>A — Subtle, in-theme. Safest. <br/>B — Kitchen display, dark with honey accent. <strong>Recommended</strong> — clearest from across the counter.<br/>C — Immersive photo backdrop. Most evocative, riskier with imperfect API photos.</NoteP>
      <NoteSection label="Photography" />
      <NoteP>API images vary; we lean on warm overlays + generous radii to mask edge cases. Cards use 4:3 with object-cover; titles get a 2-line clamp; a min-height keeps the grid stable.</NoteP>
      <NoteSection label="Motion" />
      <NoteP>Calm — 180–240ms ease-out. Heart fills with a brief pop. Cook Mode steps slide horizontally. No flashy gestures.</NoteP>
      <NoteSection label="Dark mode" />
      <NoteP>Designed light first per your direction. Cook Mode B already <em>is</em> a dark surface — proves the inverse palette works. Full dark theme inherits the same accent + olive + honey, with surface = #1A140E and ink → #F6F1E8.</NoteP>
    </NotesShell>
  );
}

function TokensSheet() {
  const t = window.SkilletTokens;
  return (
    <NotesShell>
      <NoteH>Design tokens</NoteH>
      <NoteSection label="Color · brand" />
      <NoteRow label="accent (terracotta)" val={t.accent} />
      <NoteRow label="accent2 (olive)" val={t.accent2} />
      <NoteRow label="honey" val={t.honey} />
      <NoteSection label="Color · surface" />
      <NoteRow label="bg (cream)" val={t.bg} />
      <NoteRow label="bgDeep" val={t.bgDeep} />
      <NoteRow label="surface" val={t.surface} />
      <NoteRow label="line" val={t.line} />
      <NoteSection label="Color · ink" />
      <NoteRow label="ink" val={t.ink} />
      <NoteRow label="inkSoft" val={t.inkSoft} />
      <NoteRow label="inkMuted" val={t.inkMuted} />
      <NoteSection label="Type" />
      <NoteRow label="display" val="Fraunces 500/600" />
      <NoteRow label="body" val="Inter 400/500/600/700" />
      <NoteRow label="scale" val="11/12/13/14/16/18/22/26/32/44/56" />
      <NoteSection label="Radii" />
      <NoteRow label="r4 / r8 / r12 / r16 / pill" val="4 · 8 · 12 · 16 · 999" />
      <NoteSection label="Shadow" />
      <NoteRow label="sm" val="0 1px 2px rgba(40,30,20,.06)" />
      <NoteRow label="md" val="0 6px 20px rgba(40,30,20,.08)" />
      <NoteRow label="lg" val="0 16px 40px rgba(40,30,20,.12)" />
      <NoteSection label="Touch targets" />
      <NoteRow label="min hit" val="44 × 44 px" />
      <NoteRow label="cook mode primary" val="64–72 px tall" />
    </NotesShell>
  );
}

function ComponentsSheet() {
  return (
    <NotesShell>
      <NoteH>Component inventory</NoteH>
      <NoteSection label="Buttons" />
      <NoteP>Primary · Outline · Soft · Ghost · Dark · sizes sm/md/lg/xl. Pill radius. Lead/trail icons.</NoteP>
      <NoteSection label="Inputs" />
      <NoteP>SearchInput (sm/md/lg) · ServingsAdjuster · UnitToggle · CalorieSlider · ToggleRow.</NoteP>
      <NoteSection label="Chips" />
      <NoteP>Filter chip (active/inactive) · Removable chip (× icon) · Lead-icon chip (plus, leaf, clock).</NoteP>
      <NoteSection label="Cards" />
      <NoteP>RecipeCard (4:3 portrait) · FridgeCard (horizontal w/ match count) · MacroPill · Stat block.</NoteP>
      <NoteSection label="Badges" />
      <NoteP>DietBadge — tones: olive (vegetarian/vegan), rose (pescatarian), honey (high-protein), cream (neutral).</NoteP>
      <NoteSection label="Navigation" />
      <NoteP>MobileNav (4 tabs, 78px tall + safe area) · DesktopSidebar (240px, sticky).</NoteP>
      <NoteSection label="Sheets & overlays" />
      <NoteP>BottomSheet (filters) · Modal sheet · Inline confirm (favorite remove).</NoteP>
      <NoteSection label="Feedback" />
      <NoteP>Skeleton (cards + heading) · Offline banner · Empty state (icon + headline + CTA) · Error state.</NoteP>
      <NoteSection label="Brand" />
      <NoteP>SkilletWordmark · SkilletMark (icon) · AppIcon (favicon ↔ launcher size).</NoteP>
    </NotesShell>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
