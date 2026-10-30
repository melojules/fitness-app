import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { DemoTile } from '../../components/DemoTile';
import { Chip } from '../../components/Chip';
import { useProfile } from '../../state/ProfileContext';
import { useWorkoutSession } from '../../state/WorkoutSessionContext';
import { getExercise } from '../../data/exerciseLibrary';
import { suggestExerciseTarget } from '../../logic/exerciseRecommendation';
import { muscleLabel } from '../../logic/muscleVolume';
import { SetRow } from './components/SetRow';
import { RestBar } from './components/RestBar';
import type { LogStackParamList } from '../../navigation/types';
import type { SetLog, WorkoutLog } from '../../models/types';

function formatElapsed(totalSec: number) {
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function LiveWorkoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LogStackParamList>>();
  const { profile, activeProgram, workoutLogs, latestMetrics, addWorkoutLog } = useProfile();
  const { session, initSets, toggleSet, updateSetField, addSet, removeLastSet, setCurrentExerciseIndex, resetSession } =
    useWorkoutSession();

  const [paused, setPaused] = useState(false);
  const [, forceTick] = useState(0);
  const startedAtRef = useRef(session.startedAt ?? Date.now());
  const pauseStartRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);

  const [rest, setRest] = useState<{ remaining: number; total: number; nextLabel: string } | null>(null);

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!rest) return;
    if (rest.remaining <= 0) {
      setRest(null);
      return;
    }
    const id = setTimeout(() => setRest((prev) => (prev ? { ...prev, remaining: prev.remaining - 1 } : prev)), 1000);
    return () => clearTimeout(id);
  }, [rest]);

  const day = useMemo(
    () => activeProgram?.days.find((d) => d.id === session.workoutDayId) ?? null,
    [activeProgram, session.workoutDayId]
  );

  const programLogs = useMemo(
    () => (activeProgram ? workoutLogs.filter((l) => l.programId === activeProgram.id) : []),
    [workoutLogs, activeProgram]
  );

  const currentIndex = session.currentExerciseIndex;
  const currentPE = day?.exercises[currentIndex] ?? null;
  const nextPE = day?.exercises[currentIndex + 1] ?? null;

  const currentExercise = currentPE
    ? getExercise(session.exerciseOverrides[currentPE.id] ?? currentPE.exerciseId)
    : null;
  const nextExercise = nextPE ? getExercise(session.exerciseOverrides[nextPE.id] ?? nextPE.exerciseId) : null;

  const target = useMemo(() => {
    if (!currentExercise || !currentPE || !profile || !latestMetrics) return null;
    return suggestExerciseTarget(currentExercise, currentPE, profile, latestMetrics.weightKg, programLogs);
  }, [currentExercise, currentPE, profile, latestMetrics, programLogs]);

  useEffect(() => {
    if (!currentPE || !target) return;
    if (session.loggedSets[currentPE.id]) return;
    const targetReps = parseInt(target.reps, 10) || 0;
    initSets(
      currentPE.id,
      Array.from({ length: target.sets }, (_, i) => ({
        setNumber: i + 1,
        weightKg: target.weightKg ?? 0,
        reps: targetReps,
        done: false,
      }))
    );
  }, [currentPE, target, session.loggedSets, initSets]);

  if (!activeProgram || !day || !currentPE || !currentExercise || !target) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={type.screenTitle}>No workout in progress</Text>
      </SafeAreaView>
    );
  }

  const elapsedSec = Math.max(
    0,
    Math.floor(((paused ? pauseStartRef.current ?? Date.now() : Date.now()) - startedAtRef.current - totalPausedRef.current) / 1000)
  );

  function togglePause() {
    if (!paused) {
      pauseStartRef.current = Date.now();
      setPaused(true);
    } else {
      totalPausedRef.current += Date.now() - (pauseStartRef.current ?? Date.now());
      pauseStartRef.current = null;
      setPaused(false);
    }
  }

  const setsForExercise = session.loggedSets[currentPE.id] ?? [];
  const lastLogForExercise = [...programLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .find((log) => log.sets.some((s) => s.exerciseId === currentExercise.id));

  function previousLabel(setNumber: number) {
    if (!lastLogForExercise) return '—';
    const sets = lastLogForExercise.sets.filter((s) => s.exerciseId === currentExercise!.id);
    const match = sets[setNumber - 1];
    return match ? `${match.weightKg}×${match.reps}` : '—';
  }

  function handleToggleSet(setNumber: number, willBeDone: boolean) {
    toggleSet(currentPE!.id, setNumber);
    if (willBeDone) {
      const isLastSet = setNumber >= setsForExercise.length;
      const nextLabel = isLastSet
        ? nextExercise
          ? `then ${nextExercise.name}`
          : 'Last set of the workout'
        : `then set ${setNumber + 1}`;
      setRest({ remaining: currentPE!.restSec, total: currentPE!.restSec, nextLabel });
    } else {
      setRest(null);
    }
  }

  function handleAddSet() {
    const last = setsForExercise[setsForExercise.length - 1];
    addSet(currentPE!.id, last?.weightKg ?? target!.weightKg ?? 0, last?.reps ?? (parseInt(target!.reps, 10) || 0));
  }

  function goToNextExercise() {
    if (currentIndex < day!.exercises.length - 1) {
      setCurrentExerciseIndex(currentIndex + 1);
      setRest(null);
    }
  }

  function handleFinish() {
    const sets: SetLog[] = [];
    let tonnage = 0;
    day!.exercises.forEach((pe) => {
      const exerciseId = session.exerciseOverrides[pe.id] ?? pe.exerciseId;
      const loggedSets = session.loggedSets[pe.id] ?? [];
      loggedSets
        .filter((s) => s.done)
        .forEach((s) => {
          sets.push({ id: `set_${pe.id}_${s.setNumber}`, exerciseId, setNumber: s.setNumber, reps: s.reps, weightKg: s.weightKg });
          tonnage += s.reps * s.weightKg;
        });
    });

    const log: WorkoutLog = {
      id: `log_${Date.now()}`,
      programId: activeProgram!.id,
      workoutDayId: day!.id,
      date: new Date().toISOString(),
      durationMin: Math.max(1, Math.round(elapsedSec / 60)),
      sets,
      tonnageKg: Math.round(tonnage),
    };

    addWorkoutLog(log);
    resetSession();
    navigation.replace('SessionSummary', { logId: log.id });
  }

  const engagedMuscles = [...currentExercise.primaryMuscles, ...currentExercise.secondaryMuscles];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={togglePause} style={styles.pauseButton}>
          <Text style={styles.pauseText}>{paused ? 'Resume' : 'Pause'}</Text>
        </Pressable>
        <Text style={styles.timer}>{formatElapsed(elapsedSec)}</Text>
        <View style={styles.hrBlock}>
          <Text style={styles.hrValue}>—</Text>
          <Text style={styles.hrLabel}>bpm</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.exerciseHeader}>
          <DemoTile size={112} tempoSec={currentExercise.demoTempoSec} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{currentExercise.name}</Text>
            <View style={styles.chipRow}>
              {engagedMuscles.slice(0, 3).map((m, i) => (
                <Chip key={m} label={muscleLabel(m)} tone={i === 0 ? 'accent' : 'neutral'} />
              ))}
            </View>
            <View style={styles.chipRow}>
              <Chip label={`${target.sets}×${target.reps}`} tone="neutral" />
              <Chip label={`${currentPE.restSec}s rest`} tone="neutral" />
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { width: 24 }]}>SET</Text>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>PREV</Text>
            <Text style={[styles.tableHeaderText, { width: 56, textAlign: 'center' }]}>KG</Text>
            <Text style={[styles.tableHeaderText, { width: 56, textAlign: 'center' }]}>REPS</Text>
            <Text style={[styles.tableHeaderText, { width: 34, textAlign: 'center' }]}> </Text>
          </View>
          {setsForExercise.map((set) => (
            <SetRow
              key={set.setNumber}
              set={set}
              previousLabel={previousLabel(set.setNumber)}
              onChangeWeight={(v) => updateSetField(currentPE!.id, set.setNumber, { weightKg: Number(v) || 0 })}
              onChangeReps={(v) => updateSetField(currentPE!.id, set.setNumber, { reps: Number(v) || 0 })}
              onToggle={() => handleToggleSet(set.setNumber, !set.done)}
            />
          ))}
          <View style={styles.addSetRow}>
            <Pressable onPress={handleAddSet}>
              <Text style={styles.addSetText}>+ Add set</Text>
            </Pressable>
            {setsForExercise.length > target.sets && (
              <Pressable onPress={() => removeLastSet(currentPE!.id)}>
                <Text style={styles.removeSetText}>Remove last</Text>
              </Pressable>
            )}
          </View>
        </View>

        {rest && <RestBar remaining={rest.remaining} total={rest.total} nextLabel={rest.nextLabel} />}

        {nextExercise && (
          <View style={styles.upNext}>
            <Text style={type.eyebrow}>UP NEXT</Text>
            <Text style={styles.upNextName}>{nextExercise.name}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Finish workout" onPress={handleFinish} style={styles.finishButton} />
        <Pressable
          onPress={goToNextExercise}
          disabled={!nextExercise}
          style={[styles.nextButton, !nextExercise && styles.nextButtonDisabled]}
        >
          <Text style={styles.nextButtonText}>›</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  pauseButton: {
    width: 70,
  },
  pauseText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.accentLight,
  },
  timer: {
    fontFamily: fontFamily.mono,
    fontSize: 18,
    color: colors.ink,
  },
  hrBlock: {
    width: 70,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
    gap: 3,
  },
  hrValue: {
    fontFamily: fontFamily.mono,
    fontSize: 15,
    color: colors.inkFaint,
  },
  hrLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.inkFaint,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  exerciseHeader: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  exerciseInfo: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  exerciseName: {
    fontFamily: fontFamily.bold,
    fontSize: 19,
    letterSpacing: -0.3,
    color: colors.ink,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  table: {
    gap: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  tableHeaderText: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.inkFaint,
  },
  addSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  addSetText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.accentLight,
  },
  removeSetText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.inkFaint,
  },
  upNext: {
    gap: 4,
  },
  upNextName: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.inkMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  finishButton: {
    flex: 1,
  },
  nextButton: {
    width: 55,
    height: 55,
    borderRadius: radius.button,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.ink,
  },
});
