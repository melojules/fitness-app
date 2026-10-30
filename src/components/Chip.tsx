import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../theme';

type ChipProps = {
  label: string;
  tone?: 'accent' | 'neutral' | 'positive';
  icon?: React.ReactNode;
};

export function Chip({ label, tone = 'neutral', icon }: ChipProps) {
  const toneStyles = {
    accent: { bg: colors.accentWash15, fg: colors.accentLight },
    neutral: { bg: colors.surfaceAlt, fg: colors.inkMuted },
    positive: { bg: 'rgba(59,208,122,0.15)', fg: colors.positive },
  }[tone];

  return (
    <View style={[styles.chip, { backgroundColor: toneStyles.bg }]}>
      {icon}
      <Text style={[styles.label, { color: toneStyles.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
  },
});
