import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function RestBar({ remaining, total, nextLabel }: { remaining: number; total: number; nextLabel: string }) {
  const progress = 1 - remaining / total;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Rest</Text>
        <Text style={styles.time}>{formatTime(remaining)}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.min(100, progress * 100)}%` }]} />
      </View>
      <Text style={styles.next}>{nextLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.md,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.inkMuted,
  },
  time: {
    fontFamily: fontFamily.mono,
    fontSize: 20,
    color: colors.accentLight,
  },
  track: {
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
  next: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
});
