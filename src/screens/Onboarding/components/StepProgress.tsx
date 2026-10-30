import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.container}>
      <View style={styles.segments}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[styles.segment, i < step && styles.segmentFilled]}
          />
        ))}
      </View>
      <Text style={styles.eyebrow}>STEP {step} OF {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  segments: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt2,
  },
  segmentFilled: {
    backgroundColor: colors.accent,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.3,
    color: colors.inkFaint,
    textTransform: 'uppercase',
  },
});
