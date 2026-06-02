// AI-LangLearn design system — "Indigo & Sumi-ink".
//
// Goal: a calm, premium, adult feel — the opposite of a loud cartoonish clone.
// One confident indigo accent, warm paper backgrounds, deep ink text, flat
// surfaces with soft (not chunky 3D) elevation. Scripts (kana/hangul) are the
// hero, so type is generous and legible.
//
// Every screen imports COLORS / SPACING / RADIUS / TYPE from here so the whole
// app shares one look and can be re-themed in one place.

export const COLORS = {
  // Brand
  primary: '#4F46E5',      // indigo — primary accent / CTA
  primaryDark: '#3730A3',  // pressed / borders
  primarySoft: '#ECEBFB',  // tinted selection fill
  primaryBorder: '#A5A3F0',

  // Semantic
  success: '#2FB67A',
  successDark: '#1E8A5B',
  successSoft: '#DDF3E8',
  danger: '#E5484D',
  dangerDark: '#C62A2F',
  dangerSoft: '#FBE3E4',
  warning: '#F59E0B',      // streak flame
  warningDark: '#B45309',
  violet: '#8B5CF6',       // custom path / accent 2
  violetDark: '#6D28D9',
  gold: '#EAB308',         // gems / league

  // Neutrals (warm paper + sumi ink)
  bg: '#FAF9F5',           // app background (warm paper)
  surface: '#FFFFFF',      // cards
  surfaceAlt: '#F4F2EC',   // subtle alt surface
  ink: '#1F2430',          // primary text (sumi ink, not pure black)
  inkSoft: '#4B5160',      // secondary text
  muted: '#8A8F98',        // hints / inactive
  border: '#E6E3DA',       // warm hairline border
  borderStrong: '#D8D3C6',

  // Dark surfaces (call screen, future dark mode)
  dark: '#14161C',
  darkAlt: '#2A2D36',
  white: '#FFFFFF',
};

export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const RADIUS = { sm: 8, md: 14, lg: 20, pill: 999 };

export const TYPE = {
  // weights kept to 2 effective steps for a clean, premium read
  display: { fontSize: 30, fontWeight: '700', color: COLORS.ink },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.ink },
  heading: { fontSize: 18, fontWeight: '600', color: COLORS.ink },
  body: { fontSize: 16, fontWeight: '400', color: COLORS.inkSoft },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  // large glyph style for kana/hangul characters
  glyph: { fontSize: 40, fontWeight: '500', color: COLORS.ink },
};

// Soft, flat elevation (no chunky bottom-border 3D).
export const SHADOW = {
  card: {
    shadowColor: '#1F2430',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#1F2430',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};

export default { COLORS, SPACING, RADIUS, TYPE, SHADOW };
