import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { useProfile } from '../../state/ProfileContext';
import { useWorkoutSession } from '../../state/WorkoutSessionContext';
import { getExercise } from '../../data/exerciseLibrary';
import { suggestExerciseTarget } from '../../logic/exerciseRecommendation';
import { aggregateMuscleVolume } from '../../logic/muscleVolume';
import { getTodaysDay } from '../../logic/workoutRotation';
import { ExerciseRow } from './components/ExerciseRow';
import { MuscleMap } from './components/MuscleMap';
import { MuscleVolumeBars } from './components/MuscleVolumeBars';
import type { LogStackParamList } from '../../navigation/types';

export function WorkoutDayScreen() {
  const { profile, activeProgram, workoutLogs, latestMetrics } = useProfile();
  const { session, startSession } = useWorkoutSession();
  const navigation = useNavigation<NativeStackNavigationProp<LogStackParamList>>();
  const route = useRoute<RouteProp<LogStackParamList, 'WorkoutDay'>>();

  const programLogs = useMemo(
    () => (activeProgram ? workoutLogs.filter((l) => l.programId === activeProgram.id) : []),
    [workoutLogs, activeProgram]
  );

  const day = useMemo(() => {
    if (!activeProgram) return null;
    return activeProgram.days.find((d) => d.id === route.params?.dayId) ?? null;
  }, [activeProgram, route.params?.dayId]);

  const isToday = useMemo(() => {
    if (!activeProgram || !day) return false;
    return getTodaysDay(activeProgram, programLogs).id === day.id;
  }, [activeProgram, day, programLogs]);

  const resolvedExercises = useMemo(() => {
    if (!day) return [];
    return day.exercises.map((pe) => {
      const exerciseId = session.exerciseOverrides[pe.id] ?? pe.exerciseId;
      return { programExercise: pe, exercise: getExercise(exerciseId) };
    });
  }, [day, session.exerciseOverrides]);

  const targets = useMemo(() => {
    if (!profile || !latestMetrics) return [];
    return resolvedExercises.map(({ programExercise, exercise }) =>
      suggestExerciseTarget(exercise, programExercise, profile, latestMetrics.weightKg, programLogs)
    );
  }, [resolvedExercises, profile, latestMetrics, programLogs]);

  const volumes = useMemo(() => (day ? aggregateMuscleVolume(day) : []), [day]);

  const overloadNote = useMemo(() => {
    const idx = targets.findIndex((t) => !t.isBodyweight && t.note.startsWith('Up from'));
    if (idx >= 0) return `${resolvedExercises[idx].exercise.name}: ${targets[idx].note}`;
    const first = targets.find((t) => !t.isBodyweight);
    return first ? `${resolvedExercises[targets.indexOf(first)].exercise.name}: ${first.note}` : null;
  }, [targets, resolvedExercises]);

  if (!activeProgram || !day) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyState}>
          <Text style={type.screenTitle}>Workout day not found</Text>
          <Text style={styles.emptyBody}>
            Head back to the Log tab and pick a workout day to get started.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  const estMinutes = Math.round(
    day.exercises.reduce((sum, e) => sum + e.sets * (e.restSec + 45), 0) / 60
  );

  function handleStart() {
    startSession(day!.id);
    navigation.navigate('LiveWorkout');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} style={styles.backRow}>
        <Text style={styles.backText}>‹ Log</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={type.screenTitle}>{day.name}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {activeProgram.name} · {day.exercises.length} exercises · {totalSets} sets · ~{estMinutes} min
          </Text>
        </View>

        <View style={styles.exerciseList}>
          {resolvedExercises.map(({ programExercise, exercise }, i) => (
            <ExerciseRow
              key={programExercise.id}
              exercise={exercise}
              target={targets[i]}
              onSwap={() => navigation.navigate('ExerciseSwap', { programExerciseId: programExercise.id })}
            />
          ))}
        </View>

        <Card style={styles.muscleCard}>
          <Text style={type.cardTitle}>What today hits</Text>
          <View style={styles.muscleRow}>
            <MuscleMap volumes={volumes} />
            <MuscleVolumeBars volumes={volumes} />
          </View>
        </Card>

        {overloadNote && (
          <Card style={styles.noteCard}>
            <Text style={type.eyebrow}>PROGRESSIVE OVERLOAD</Text>
            <Text style={styles.noteText}>{overloadNote}</Text>
          </Card>
        )}

        <PrimaryButton label="Start workout" onPress={handleStart} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.xl,
  },
  backRow: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
  },
  backText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.accentLight,
  },
  header: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  todayBadge: {
    backgroundColor: colors.accentWash15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  todayBadgeText: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: colors.accentLight,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
  exerciseList: {
    gap: 2,
  },
  muscleCard: {
    gap: spacing.md,
  },
  muscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  noteCard: {
    gap: 6,
  },
  noteText: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  emptyState: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  emptyBody: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
});
