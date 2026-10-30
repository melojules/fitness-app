import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';
import { DemoTile } from '../../../components/DemoTile';
import { muscleLabel } from '../../../logic/muscleVolume';
import type { ExerciseLibraryItem } from '../../../models/types';
import type { ExerciseTarget } from '../../../logic/exerciseRecommendation';

export function ExerciseRow({
  exercise,
  target,
  onSwap,
}: {
  exercise: ExerciseLibraryItem;
  target: ExerciseTarget;
  onSwap: () => void;
}) {
  const equipmentLine = `${muscleLabel(exercise.primaryMuscles[0])} · ${exercise.equipment[0].replace('_', ' ')}`;
  const targetLine = target.isBodyweight
    ? `${target.sets} × ${target.reps}`
    : `${target.sets} × ${target.reps}${target.weightKg ? ` · ${target.weightKg}kg` : ''}`;

  return (
    <View style={styles.row}>
      <DemoTile size={52} tempoSec={exercise.demoTempoSec} />
      <View style={styles.info}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>{equipmentLine}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.target}>{targetLine}</Text>
        <Pressable onPress={onSwap} hitSlop={8}>
          <Text style={styles.swap}>swap</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  meta: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.inkFaint,
    textTransform: 'capitalize',
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  target: {
    fontFamily: fontFamily.mono,
    fontSize: 12.5,
    color: colors.ink,
  },
  swap: {
    fontFamily: fontFamily.semibold,
    fontSize: 11.5,
    color: colors.accentLight,
  },
});
