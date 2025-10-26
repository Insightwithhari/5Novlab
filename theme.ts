import { AccentColor, BackgroundColor, Theme } from "./types";

// Define base color palettes
const ACCENT_COLORS = {
  teal: { light: { base: '#0d9488', hover: '#0f766e', ring: '#14b8a6' }, dark: { base: '#14b8a6', hover: '#0d9488', ring: '#2dd4bf' } },
  rose: { light: { base: '#e11d48', hover: '#be123c', ring: '#f43f5e' }, dark: { base: '#f43f5e', hover: '#e11d48', ring: '#fb7185' } },
  sky:  { light: { base: '#0ea5e9', hover: '#0284c7', ring: '#38bdf8' }, dark: { base: '#38bdf8', hover: '#0ea5e9', ring: '#7dd3fc' } },
  violet: { light: { base: '#7c3aed', hover: '#6d28d9', ring: '#8b5cf6' }, dark: { base: '#8b5cf6', hover: '#7c3aed', ring: '#a78bfa' } },
};

const BACKGROUND_COLORS = {
  slate: {
    light: { bg: '#f8fafc', fg: '#020617', mutedFg: '#475569', cardBg: '#ffffff', border: '#cbd5e1', inputBg: '#e2e8f0' },
    dark:  { bg: '#020617', fg: '#f8fafc', mutedFg: '#94a3b8', cardBg: '#0f172a', border: '#1e293b', inputBg: '#1e293b' }
  },
  gray: {
    light: { bg: '#f9fafb', fg: '#111827', mutedFg: '#4b5563', cardBg: '#ffffff', border: '#d1d5db', inputBg: '#e5e7eb' },
    dark:  { bg: '#111827', fg: '#f9fafb', mutedFg: '#9ca3af', cardBg: '#1f2937', border: '#374151', inputBg: '#374151' }
  },
  stone: {
    light: { bg: '#fafaf9', fg: '#1c1917', mutedFg: '#57534e', cardBg: '#ffffff', border: '#d6d3d1', inputBg: '#e7e5e4' },
    dark:  { bg: '#1c1917', fg: '#fafaf9', mutedFg: '#a8a29e', cardBg: '#292524', border: '#44403c', inputBg: '#44403c' }
  },
  zinc: {
    light: { bg: '#fafafa', fg: '#18181b', mutedFg: '#52525b', cardBg: '#ffffff', border: '#d4d4d8', inputBg: '#e4e4e7' },
    dark:  { bg: '#18181b', fg: '#fafafa', mutedFg: '#a1a1aa', cardBg: '#27272a', border: '#3f3f46', inputBg: '#3f3f46' }
  },
  neutral: {
    light: { bg: '#fafafa', fg: '#171717', mutedFg: '#525252', cardBg: '#ffffff', border: '#d4d4d4', inputBg: '#e5e5e5' },
    dark:  { bg: '#171717', fg: '#fafafa', mutedFg: '#a3a3a3', cardBg: '#262626', border: '#404040', inputBg: '#404040' }
  },
};

// Type definition for the final config object
type ThemeConfig = Record<AccentColor, Record<BackgroundColor, Record<Theme, Record<string, string>>>>;

// Generate the final configuration object
export const THEME_CONFIG = {} as ThemeConfig;

(Object.keys(ACCENT_COLORS) as AccentColor[]).forEach(accent => {
  THEME_CONFIG[accent] = {} as Record<BackgroundColor, Record<Theme, Record<string, string>>>;
  (Object.keys(BACKGROUND_COLORS) as BackgroundColor[]).forEach(bg => {
    THEME_CONFIG[accent][bg] = {
      light: {
        'primary-color': ACCENT_COLORS[accent].light.base,
        'primary-color-hover': ACCENT_COLORS[accent].light.hover,
        'primary-ring-color': ACCENT_COLORS[accent].light.ring,
        'background-color': BACKGROUND_COLORS[bg].light.bg,
        'foreground-color': BACKGROUND_COLORS[bg].light.fg,
        'muted-foreground-color': BACKGROUND_COLORS[bg].light.mutedFg,
        'card-background-color': BACKGROUND_COLORS[bg].light.cardBg,
        'card-foreground-color': BACKGROUND_COLORS[bg].light.fg,
        'popover-background-color': BACKGROUND_COLORS[bg].light.cardBg,
        'popover-foreground-color': BACKGROUND_COLORS[bg].light.fg,
        'border-color': BACKGROUND_COLORS[bg].light.border,
        'input-background-color': BACKGROUND_COLORS[bg].light.inputBg,
      },
      dark: {
        'primary-color': ACCENT_COLORS[accent].dark.base,
        'primary-color-hover': ACCENT_COLORS[accent].dark.hover,
        'primary-ring-color': ACCENT_COLORS[accent].dark.ring,
        'background-color': BACKGROUND_COLORS[bg].dark.bg,
        'foreground-color': BACKGROUND_COLORS[bg].dark.fg,
        'muted-foreground-color': BACKGROUND_COLORS[bg].dark.mutedFg,
        'card-background-color': BACKGROUND_COLORS[bg].dark.cardBg,
        'card-foreground-color': BACKGROUND_COLORS[bg].dark.fg,
        'popover-background-color': BACKGROUND_COLORS[bg].dark.cardBg,
        'popover-foreground-color': BACKGROUND_COLORS[bg].dark.fg,
        'border-color': BACKGROUND_COLORS[bg].dark.border,
        'input-background-color': BACKGROUND_COLORS[bg].dark.inputBg,
      }
    };
  });
});