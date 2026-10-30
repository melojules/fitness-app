import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { Card } from '../../components/Card';
import { Sparkline } from '../../components/Sparkline';
import { SegmentedToggle } from '../Onboarding/components/SegmentedToggle';
import { PillGroup } from '../Onboarding/components/PillGroup';
import { useProfile } from '../../state/ProfileContext';
import { getExercise } from '../../data/exerciseLibrary';
import { estimatedOneRepMaxHistory } from '../../logic/exerciseRecommendation';
import { isSessionPR } from '../../logic/personalRecords';
import { bmiLabel } from '../../models/metrics';
import { BarChart } from './components/BarChart';
import { SessionRow } from '../Home/SessionRow';

type Tab = 'strength' | 'body' | 'sessions';

export function ProgressScreen() {
  const { profile, workoutLogs, programs, latestMetrics } = useProfile();
  const [tab, setTab] = useState<Tab>('strength');

  const loggedExerciseIds = useMemo(
    () => [...new Set(workoutLogs.flatMap((l) => l.sets.map((s) => s.exerciseId)))],
    [workoutLogs]
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const activeExerciseId = selectedExerciseId ?? loggedExerciseIds[0] ?? null;

  const exerciseHistory = useMemo(
    () => (activeExerciseId ? estimatedOneRepMaxHistory(activeExerciseId, workoutLogs) : []),
    [activeExerciseId, workoutLogs]
  );

  const otherLifts = useMemo(() => {
    const tonnageByExercise = new Map<string, number>();
    workoutLogs.forEach((log) => {
      log.sets.forEach((s) => {
        tonnageByExercise.set(s.exerciseId, (tonnageByExercise.get(s.exerciseId) ?? 0) + s.weightKg * s.reps);
      });
    });
    const max = Math.max(...tonnageByExercise.values(), 1);
    return [...tonnageByExercise.entries()]
      .filter(([id]) => id !== activeExerciseId)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, tonnage]) => ({ id, name: getExercise(id).name, share: tonnage / max }));
  }, [workoutLogs, activeExerciseId]);

  if (!profile) return null;

  const sortedSessions = [...workoutLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.screenTitle}>Progress</Text>

        <SegmentedToggle
          options={[
            { value: 'strength', label: 'Strength' },
            { value: 'body', label: 'Body' },
            { value: 'sessions', label: 'Sessions' },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'strength' && (
          <>
            {loggedExerciseIds.length === 0 ? (
              <EmptyState text="Log a workout to start tracking strength progress." />
            ) : (
              <>
                <PillGroup
                  options={loggedExerciseIds.map((id) => ({ value: id, label: getExercise(id).name }))}
                  selected={activeExerciseId ? [activeExerciseId] : []}
                  onToggle={setSelectedExerciseId}
                />

                <Card style={styles.chartCard}>
                  <BarChart values={exerciseHistory.slice(-12).map((h) => h.oneRepMax)} />
                  <View style={styles.statStrip}>
                    <Stat
                      label="EST. 1RM"
                      value={exerciseHistory.length ? `${exerciseHistory[exerciseHistory.length - 1].oneRepMax}kg` : '—'}
                    />
                    <Stat label="SESSIONS" value={String(exerciseHistory.length)} />
                  </View>
                </Card>

                {otherLifts.length > 0 && (
                  <View style={styles.section}>
                    <Text style={type.cardTitle}>Other lifts</Text>
                    <View style={styles.otherLiftsList}>
                      {otherLifts.map((lift) => (
                        <View key={lift.id} style={styles.otherLiftRow}>
                          <Text style={styles.otherLiftName}>{lift.name}</Text>
                          <View style={styles.otherLiftTrack}>
                            <View style={[styles.otherLiftFill, { width: `${lift.share * 100}%` }]} />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {tab === 'body' && (
          <>
            <Card style={styles.bodyCard}>
              <Text style={type.eyebrow}>BODY WEIGHT</Text>
              <Text style={styles.bodyValue}>{latestMetrics?.weightKg.toFixed(1)} kg</Text>
              <Sparkline
                data={profile.metricsHistory.map((m) => m.weightKg)}
                width={260}
                height={50}
              />
            </Card>
            <View style={styles.metricRow}>
              <Card style={styles.metricCard}>
                <Text style={type.eyebrow}>BMI</Text>
                <Text style={styles.metricValue}>{latestMetrics?.bmi.toFixed(1)}</Text>
                <Text style={styles.metricSub}>{latestMetrics ? bmiLabel(latestMetrics.bmi) : ''}</Text>
              </Card>
              <Card style={styles.metricCard}>
                <Text style={type.eyebrow}>BMR</Text>
                <Text style={styles.metricValue}>{latestMetrics?.bmr}</Text>
                <Text style={styles.metricSub}>kcal/day</Text>
              </Card>
            </View>
          </>
        )}

        {tab === 'sessions' && (
          <>
            {sortedSessions.length === 0 ? (
              <EmptyState text="Your completed sessions will show up here." />
            ) : (
              <Card padded={false} style={styles.sessionsCard}>
                <View style={{ paddingHorizontal: spacing.lg }}>
                  {sortedSessions.map((log, i) => {
                    const dayProgram = programs.find((p) => p.id === log.programId);
                    const dayName = dayProgram?.days.find((d) => d.id === log.workoutDayId)?.name ?? 'Workout';
                    return (
                      <SessionRow
                        key={log.id}
                        session={{
                          id: log.id,
                          dayName,
                          date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                          durationMin: log.durationMin,
                          tonnageKg: log.tonnageKg,
                          isPR: isSessionPR(log, workoutLogs),
                        }}
                        isLast={i === sortedSessions.length - 1}
                      />
                    );
                  })}
                </View>
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
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
    gap: spacing.lg,
  },
  chartCard: {
    gap: spacing.md,
  },
  statStrip: {
    flexDirection: 'row',
    gap: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: spacing.md,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 18,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.inkFaint,
  },
  section: {
    gap: spacing.md,
  },
  otherLiftsList: {
    gap: spacing.sm,
  },
  otherLiftRow: {
    gap: 4,
  },
  otherLiftName: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkMuted,
  },
  otherLiftTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt2,
    overflow: 'hidden',
  },
  otherLiftFill: {
    height: '100%',
    backgroundColor: colors.accentLight,
    borderRadius: radius.pill,
  },
  bodyCard: {
    gap: spacing.sm,
  },
  bodyValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: 4,
  },
  metricValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: colors.ink,
  },
  metricSub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  sessionsCard: {
    paddingVertical: 4,
  },
  emptyState: {
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
