import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import type { SessionSet } from '../../../state/WorkoutSessionContext';

export function SetRow({
  set,
  previousLabel,
  onChangeWeight,
  onChangeReps,
  onToggle,
}: {
  set: SessionSet;
  previousLabel: string;
  onChangeWeight: (value: string) => void;
  onChangeReps: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.row, set.done && styles.rowDone]}>
      <Text style={styles.cellSet}>{set.setNumber}</Text>
      <Text style={styles.cellPrevious}>{previousLabel}</Text>
      <TextInput
        style={[styles.input, set.done && styles.inputDone]}
        value={String(set.weightKg || '')}
        onChangeText={onChangeWeight}
        keyboardType="decimal-pad"
        editable={!set.done}
        placeholder="0"
        placeholderTextColor={colors.inkFaint}
      />
      <TextInput
        style={[styles.input, set.done && styles.inputDone]}
        value={String(set.reps || '')}
        onChangeText={onChangeReps}
        keyboardType="number-pad"
        editable={!set.done}
        placeholder="0"
        placeholderTextColor={colors.inkFaint}
      />
      <Pressable onPress={onToggle} style={[styles.check, set.done && styles.checkDone]}>
        {set.done && <Text style={styles.checkMark}>✓</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
  },
  rowDone: {
    opacity: 0.85,
  },
  cellSet: {
    width: 24,
    fontFamily: fontFamily.mono,
    fontSize: 13,
    color: colors.inkFaint,
  },
  cellPrevious: {
    flex: 1,
    fontFamily: fontFamily.mono,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
  input: {
    width: 56,
    height: 38,
    borderRadius: radius.field,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    color: colors.ink,
    fontFamily: fontFamily.mono,
    fontSize: 14,
    textAlign: 'center',
  },
  inputDone: {
    backgroundColor: colors.accentWash15,
    borderColor: colors.accent,
    color: colors.accentLight,
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkMark: {
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
});
