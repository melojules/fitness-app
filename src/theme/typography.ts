// Design tokens — see uploads/fitness-app-design-spec.md §2 Type
import { colors } from './colors';

export const fontFamily = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extrabold: 'Outfit_800ExtraBold',
  light: 'Outfit_300Light',
  mono: 'DMMono_500Medium',
  monoBold: 'DMMono_500Medium',
};

export const type = {
  screenTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    letterSpacing: -0.7,
    color: colors.ink,
  },
  heroNumeral: {
    fontFamily: fontFamily.extrabold,
    fontSize: 48,
    letterSpacing: -1.6,
    color: colors.ink,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.ink,
  },
  body: {
    fontFamily: fontFamily.medium,
    fontSize: 14.5,
    lineHeight: 21.5,
    color: colors.inkMuted,
  },
  bodyStrong: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    lineHeight: 21.5,
    color: colors.ink,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    textTransform: 'uppercase' as const,
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    color: colors.inkFaint,
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: 14,
    color: colors.ink,
  },
};
