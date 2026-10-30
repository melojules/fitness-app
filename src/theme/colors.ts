// Design tokens — see uploads/fitness-app-design-spec.md §2 Color
export const colors = {
  bg: '#0B0B0D',
  surface: '#141418',
  surfaceRaised: '#16161B',
  surfaceAlt: '#17171C',
  surfaceAlt2: '#1E1E24',
  hairline: 'rgba(255,255,255,0.07)',

  ink: '#F2F3F5',
  inkMuted: 'rgba(242,243,245,0.55)',
  inkFaint: 'rgba(242,243,245,0.4)',

  accent: '#0A84FF',
  accentLight: '#5AB0FF',
  accentDeep: '#0A4DBE',
  accentWash10: 'rgba(10,132,255,0.1)',
  accentWash15: 'rgba(10,132,255,0.15)',
  accentWash20: 'rgba(10,132,255,0.2)',

  positive: '#3BD07A',
  live: '#FF453A',
} as const;

// expo-linear-gradient start/end points approximating CSS `155deg`
export const heroGradient = {
  colors: [colors.accent, colors.accentDeep] as const,
  start: { x: 0.15, y: 0 },
  end: { x: 0.85, y: 1 },
};
