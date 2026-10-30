import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

export function AgeStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>AGE</Text>
      <View style={styles.row}>
        <Pressable style={styles.stepButton} onPress={() => onChange(Math.max(13, value - 1))}>
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>
        <Text style={styles.numeral}>{value}</Text>
        <Pressable style={styles.stepButton} onPress={() => onChange(Math.min(99, value + 1))}>
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 10,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numeral: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    letterSpacing: -1,
    color: colors.ink,
  },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceAlt2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
    marginTop: -2,
  },
});
