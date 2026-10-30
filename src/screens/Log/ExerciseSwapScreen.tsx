import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { DemoTile } from '../../components/DemoTile';
import { useProfile } from '../../state/ProfileContext';
import { useWorkoutSession } from '../../state/WorkoutSessionContext';
import { useToast } from '../../components/Toast';
import { getExercise } from '../../data/exerciseLibrary';
import { findSwapOptions } from '../../logic/exerciseSwap';
import { muscleLabel } from '../../logic/muscleVolume';
import type { LogStackParamList } from '../../navigation/types';

export function ExerciseSwapScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<LogStackParamList, 'ExerciseSwap'>>();
  const { profile, activeProgram, workoutLogs } = useProfile();
  const { session, swapExercise } = useWorkoutSession();
  const { showToast } = useToast();

  const { programExerciseId } = route.params;

  const currentExerciseId = useMemo(() => {
    if (!activeProgram) return null;
    for (const day of activeProgram.days) {
      const pe = day.exercises.find((e) => e.id === programExerciseId);
      if (pe) return session.exerciseOverrides[pe.id] ?? pe.exerciseId;
    }
    return null;
  }, [activeProgram, programExerciseId, session.exerciseOverrides]);

  const current = currentExerciseId ? getExercise(currentExerciseId) : null;

  const options = useMemo(() => {
    if (!current || !profile) return [];
    return findSwapOptions(current, profile.equipment, workoutLogs);
  }, [current, profile, workoutLogs]);

  if (!current) return null;

  function handleSwap(exerciseId: string) {
    swapExercise(programExerciseId, exerciseId);
    showToast('Swapped for this session');
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Swap exercise</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.currentBlock}>
          <Text style={type.eyebrow}>CURRENT PICK</Text>
          <View style={styles.currentRow}>
            <DemoTile size={44} tempoSec={current.demoTempoSec} />
            <View style={{ flex: 1 }}>
              <Text style={styles.currentName}>{current.name}</Text>
              <Text style={styles.currentMeta}>{muscleLabel(current.primaryMuscles[0])}</Text>
            </View>
          </View>
          <View style={styles.cues}>
            {current.cues.map((cue, i) => (
              <Text key={i} style={styles.cueText}>· {cue}</Text>
            ))}
          </View>
        </View>

        <View style={styles.optionsList}>
          {options.map(({ exercise, reason }) => (
            <Pressable key={exercise.id} style={styles.option} onPress={() => handleSwap(exercise.id)}>
              <DemoTile size={48} tempoSec={exercise.demoTempoSec} />
              <View style={styles.optionInfo}>
                <Text style={styles.optionName}>{exercise.name}</Text>
                <Text style={styles.optionMeta}>
                  {muscleLabel(exercise.primaryMuscles[0])} · {exercise.equipment[0].replace('_', ' ')} · {exercise.difficulty}
                </Text>
                <Text style={styles.optionReason}>{reason}</Text>
              </View>
            </Pressable>
          ))}
          {options.length === 0 && (
            <Text style={styles.emptyText}>No alternatives found for your selected equipment.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  cancel: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.inkMuted,
    width: 50,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 15.5,
    color: colors.ink,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  currentBlock: {
    gap: spacing.sm,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currentName: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.ink,
  },
  currentMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
  cues: {
    gap: 3,
    marginTop: 4,
  },
  cueText: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkMuted,
  },
  optionsList: {
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.md,
  },
  optionInfo: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  optionName: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  optionMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.inkFaint,
    textTransform: 'capitalize',
  },
  optionReason: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.accentLight,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkFaint,
  },
});
