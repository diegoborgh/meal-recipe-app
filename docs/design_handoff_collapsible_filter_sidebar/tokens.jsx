// Skillet design tokens — global, picked up by every screen component.
// Mutable at runtime via the Tweaks panel (accent color picker rewrites
// window.__skillet.accent on the fly and forces a re-render).

window.SkilletTokens = {
  // Backgrounds
  bg:        '#F6F1E8',   // warm cream — app background
  bgDeep:    '#EFE7D8',   // pressed/inset
  surface:   '#FFFEFA',   // cards, sheets
  surfaceAlt:'#FBF5EA',   // alt rows
  // Ink
  ink:       '#2A1F17',   // primary text
  inkSoft:   '#6B5A4A',   // secondary text
  inkMuted:  '#9C8C7C',   // tertiary, captions
  // Accents (mutable via tweaks)
  accent:    '#C0502B',   // terracotta — primary action, brand
  accentInk: '#FFFFFF',
  accent2:   '#7A8951',   // olive — secondary, success-ish
  honey:     '#E8B25C',   // honey — tertiary, highlights
  // Lines
  line:      '#E6DDD0',
  lineSoft:  '#EFE7D8',
  // System
  danger:    '#9C3A1F',
  warn:      '#C97A1F',
  // Type
  display:   '"Fraunces", Georgia, serif',
  body:      '"Inter", -apple-system, system-ui, sans-serif',
  // Radii
  r4: 4, r6: 6, r8: 8, r12: 12, r16: 16, r24: 24, rPill: 999,
  // Shadow
  shadowSm: '0 1px 2px rgba(40,30,20,0.06)',
  shadowMd: '0 6px 20px rgba(40,30,20,0.08), 0 1px 2px rgba(40,30,20,0.04)',
  shadowLg: '0 16px 40px rgba(40,30,20,0.12), 0 2px 6px rgba(40,30,20,0.06)',
};

// Live-mutable accent — components read window.SkilletTokens.accent.
// Tweaks panel calls window.__setAccent('#xxxxxx') which rewrites + rerenders.
