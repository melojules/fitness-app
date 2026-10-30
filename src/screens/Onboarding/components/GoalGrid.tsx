import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import type { Goal } from '../types';

const GOALS: { value: Goal; label: string }[] = [
  { value: 'build_muscle', label: 'Build muscle' },
  { value: 'lose_weight', label: 'Lose weight' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_health', label: 'General health' },
];

export function GoalGrid({ value, onChange }: { value: Goal | null; onChange: (goal: Goal) => void }) {
  return (
    <View style={styles.grid}>
      {GOALS.map((goal) => {
        const active = goal.value === value;
        return (
          <Pressable
            key={goal.value}
            onPress={() => onChange(goal.value)}
            style={[styles.tile, active && styles.tileActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{goal.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '47%',
    aspectRatio: 1.5,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tileActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentWash10,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.accentLight,
  },
});
