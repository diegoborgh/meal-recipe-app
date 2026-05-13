// Shared UI primitives — used by every screen.
// Buttons, chips, inputs, cards, badges, nav, search bar.

const T = () => window.SkilletTokens;

// ─────────────────────────────────────────────────────────────
// Icons — minimal stroke set, all 24x24 viewBox, currentColor stroke.
// ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    heart: <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>,
    'heart-fill': <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill={color} stroke="none"/>,
    home: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z"/>,
    fridge: <><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12"/><path d="M9 6.5v1.5"/><path d="M9 13v3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05 4.93 4.93"/></>,
    bookmark: <path d="M6 4h12v18l-6-4-6 4z"/>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chevron: <path d="m9 6 6 6-6 6"/>,
    chevronDown: <path d="m6 9 6 6 6-6"/>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    close: <><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></>,
    arrowL: <><path d="M19 12H5"/><path d="m11 19-7-7 7-7"/></>,
    filter: <><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    list: <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>,
    flame: <><path d="M12 3c0 4 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-5"/><path d="M12 12c2 0 3 1 3 3a3 3 0 0 1-6 0"/></>,
    leaf: <><path d="M5 19c8 0 14-6 14-14-7 0-13 5-14 12"/><path d="M5 19l7-7"/></>,
    wifi: <><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill={color}/></>,
    wifiOff: <><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill={color}/><path d="m3 3 18 18"/></>,
    sparkle: <><path d="M12 3v18"/><path d="M3 12h18"/><path d="m6 6 12 12"/><path d="m18 6-12 12"/></>,
    chef: <><path d="M7 14a4 4 0 0 1 0-8 4 4 0 0 1 7-1 4 4 0 0 1 4 9"/><path d="M7 14h11v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/></>,
    upload: <><path d="M12 17V5"/><path d="m6 11 6-6 6 6"/><path d="M5 19h14"/></>,
    trash: <><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6"/></>,
    moon: <path d="M21 13a9 9 0 1 1-9-10 7 7 0 0 0 9 10z"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01"/><path d="M12 11v5"/></>,
    check: <path d="m5 13 4 4L19 7"/>,
    undo: <><path d="M9 14H4V9"/><path d="M4 14a8 8 0 1 1 3-6"/></>,
    star: <path d="m12 3 2.7 6 6.3.8-4.7 4.4 1.3 6.2L12 17.6 6.4 20.4l1.3-6.2L3 9.8l6.3-.8z"/>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
    edit: <><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13 5 4 4"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M9 1h6"/><path d="M12 13l3-3"/></>,
    forks: <><path d="M5 3v18"/><path d="M5 12h6"/><path d="M11 3v9a3 3 0 0 1-3 3"/><path d="M19 3l-2 9 2 1v8"/></>,
    fire: <path d="M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5 1 1 2 1 2 0 0-2-1-3 2-5z"/>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────
const Button = ({ children, variant = 'primary', size = 'md', leadIcon, trailIcon, full, style, ...rest }) => {
  const t = T();
  const sizes = {
    sm: { h: 32, px: 12, fs: 13, gap: 6, ic: 14 },
    md: { h: 44, px: 18, fs: 14, gap: 8, ic: 16 },
    lg: { h: 56, px: 24, fs: 16, gap: 10, ic: 18 },
    xl: { h: 72, px: 28, fs: 18, gap: 12, ic: 20 },
  };
  const s = sizes[size];
  const variants = {
    primary: { bg: t.accent, color: t.accentInk, border: 'transparent', shadow: t.shadowSm },
    ghost:   { bg: 'transparent', color: t.ink, border: 'transparent', shadow: 'none' },
    outline: { bg: t.surface, color: t.ink, border: t.line, shadow: 'none' },
    soft:    { bg: t.bgDeep, color: t.ink, border: 'transparent', shadow: 'none' },
    dark:    { bg: t.ink, color: '#fff', border: 'transparent', shadow: t.shadowSm },
  };
  const v = variants[variant];
  return (
    <button {...rest} style={{
      height: s.h, padding: `0 ${s.px}px`,
      background: v.bg, color: v.color, border: `1px solid ${v.border}`,
      borderRadius: t.rPill, fontFamily: t.body, fontSize: s.fs, fontWeight: 600,
      letterSpacing: 0.1, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', gap: s.gap, boxShadow: v.shadow,
      width: full ? '100%' : 'auto', whiteSpace: 'nowrap',
      ...style,
    }}>
      {leadIcon && <Icon name={leadIcon} size={s.ic} />}
      {children}
      {trailIcon && <Icon name={trailIcon} size={s.ic} />}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Chip — filter and ingredient
// ─────────────────────────────────────────────────────────────
const Chip = ({ children, active, onRemove, leadIcon, style, ...rest }) => {
  const t = T();
  return (
    <button {...rest} style={{
      height: 32, padding: `0 ${onRemove ? 6 : 12}px 0 12px`,
      background: active ? t.accent : t.surface,
      color: active ? t.accentInk : t.ink,
      border: `1px solid ${active ? t.accent : t.line}`,
      borderRadius: t.rPill, fontFamily: t.body, fontSize: 13, fontWeight: 500,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap', ...style,
    }}>
      {leadIcon && <Icon name={leadIcon} size={14} />}
      {children}
      {onRemove && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{
          width: 18, height: 18, borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: 2, opacity: 0.7,
        }}>
          <Icon name="close" size={12} />
        </span>
      )}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Diet badge (small, on cards)
// ─────────────────────────────────────────────────────────────
const DietBadge = ({ children, tone = 'olive' }) => {
  const t = T();
  const tones = {
    olive:  { bg: '#EEF0DC', color: '#4F5A2E' },
    rose:   { bg: '#F5E2D6', color: '#8A4226' },
    honey:  { bg: '#F8EBD0', color: '#7A571A' },
    cream:  { bg: '#FBF5EA', color: t.inkSoft },
  };
  const c = tones[tone];
  return (
    <span style={{
      fontSize: 10, padding: '3px 8px', borderRadius: t.rPill,
      background: c.bg, color: c.color, fontWeight: 600,
      letterSpacing: 0.2, display: 'inline-flex', alignItems: 'center', gap: 3,
    }}>{children}</span>
  );
};

// ─────────────────────────────────────────────────────────────
// Search input
// ─────────────────────────────────────────────────────────────
const SearchInput = ({ value, placeholder = 'Search recipes…', size = 'md', onChange, style }) => {
  const t = T();
  const h = size === 'lg' ? 56 : size === 'sm' ? 36 : 48;
  const fs = size === 'lg' ? 16 : 14;
  return (
    <div style={{
      height: h, background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: t.rPill, display: 'flex', alignItems: 'center',
      padding: `0 18px`, gap: 10, ...style,
    }}>
      <Icon name="search" size={size === 'lg' ? 20 : 18} color={t.inkSoft} />
      <input
        value={value || ''}
        readOnly={!onChange}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontFamily: t.body, fontSize: fs, color: t.ink, minWidth: 0,
        }} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Recipe card — primary card; landscape variant for list view.
// Image is a real Unsplash photo passed as `img`.
// ─────────────────────────────────────────────────────────────
const RecipeCard = ({ title, time, calories, img, badges = [], saved, fridgeMatch, style, onClick }) => {
  const t = T();
  return (
    <div onClick={onClick} style={{
      background: t.surface, borderRadius: t.r12, overflow: 'hidden',
      cursor: 'pointer', display: 'flex', flexDirection: 'column',
      boxShadow: t.shadowSm, ...style,
    }}>
      <div style={{ position: 'relative', aspectRatio: '4 / 3', background: t.bgDeep, overflow: 'hidden' }}>
        <img src={img} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <button aria-label={saved ? 'Saved' : 'Save'} style={{
          position: 'absolute', top: 8, right: 8,
          width: 36, height: 36, borderRadius: 999,
          background: 'rgba(255,254,250,0.92)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)', boxShadow: t.shadowSm,
        }}>
          <Icon name={saved ? 'heart-fill' : 'heart'} size={18} color={saved ? t.accent : t.ink} />
        </button>
        {fridgeMatch && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: '#fff', color: t.accent2, fontWeight: 700, fontSize: 11,
            padding: '4px 9px', borderRadius: t.rPill, letterSpacing: 0.2,
            display: 'flex', alignItems: 'center', gap: 4,
            boxShadow: t.shadowSm,
          }}>
            <Icon name="check" size={11} strokeWidth={2.5} /> {fridgeMatch}
          </div>
        )}
      </div>
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontFamily: t.display, fontSize: 17, fontWeight: 600, lineHeight: 1.2,
          letterSpacing: -0.2, color: t.ink,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textOverflow: 'ellipsis',
          textWrap: 'pretty', minHeight: 41,
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: t.inkSoft, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={13} /> {time}
          </span>
          {calories && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="flame" size={13} /> {calories}
            </span>
          )}
        </div>
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
            {badges.map((b, i) => <DietBadge key={i} tone={b.tone}>{b.label}</DietBadge>)}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Mobile bottom nav
// ─────────────────────────────────────────────────────────────
const MobileNav = ({ active = 'home' }) => {
  const t = T();
  const items = [
    { id: 'home',     label: 'Cook',     icon: 'home' },
    { id: 'fridge',   label: 'Fridge',   icon: 'fridge' },
    { id: 'saved',    label: 'Saved',    icon: 'bookmark' },
    { id: 'settings', label: 'You',      icon: 'settings' },
  ];
  return (
    <div style={{
      height: 78, background: t.surface, borderTop: `1px solid ${t.line}`,
      display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start',
      paddingTop: 10, paddingBottom: 22,
    }}>
      {items.map((it) => {
        const on = active === it.id;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            color: on ? t.accent : t.inkSoft, cursor: 'pointer', flex: 1,
          }}>
            <Icon name={it.icon} size={22} strokeWidth={on ? 2 : 1.7} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, letterSpacing: 0.2 }}>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Logo / wordmark
// ─────────────────────────────────────────────────────────────
const SkilletWordmark = ({ size = 22, color }) => {
  const t = T();
  const c = color || t.accent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.32,
      fontFamily: t.display, fontWeight: 600, fontSize: size, letterSpacing: -0.4,
      fontStyle: 'italic', color: t.ink,
    }}>
      <SkilletMark size={size * 1.55} color={c} />
      <span>Skillet</span>
    </span>
  );
};

const SkilletMark = ({ size = 32, color }) => {
  const t = T();
  const c = color || t.accent;
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <circle cx="17" cy="20" r="11" fill={c} />
      <path d="M28 20 L34 20" stroke={c} strokeWidth="3" strokeLinecap="round" />
      <circle cx="14" cy="17" r="1.4" fill="#fff" opacity="0.7" />
      <circle cx="20" cy="22" r="1" fill="#fff" opacity="0.5" />
    </svg>
  );
};

Object.assign(window, {
  Icon, Button, Chip, DietBadge, SearchInput, RecipeCard, MobileNav,
  SkilletWordmark, SkilletMark,
});
