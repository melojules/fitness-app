import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { useProfile } from '../../state/ProfileContext';
import { getTodaysDay } from '../../logic/workoutRotation';
import type { LogStackParamList } from '../../navigation/types';

export function LogHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LogStackParamList>>();
  const { activeProgram, programs, workoutLogs } = useProfile();

  const programLogs = useMemo(
    () => (activeProgram ? workoutLogs.filter((l) => l.programId === activeProgram.id) : []),
    [workoutLogs, activeProgram]
  );

  const todaysDay = activeProgram ? getTodaysDay(activeProgram, programLogs) : null;

  const completedLogs = useMemo(
    () => [...workoutLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [workoutLogs]
  );

  function dayName(programId: string, workoutDayId: string) {
    return programs.find((program) => program.id === programId)?.days.find((day) => day.id === workoutDayId)?.name ?? 'Workout';
  }

  if (!activeProgram) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyState}>
          <Text style={type.screenTitle}>No active program</Text>
          <Text style={styles.emptyBody}>
            Head to the Programs tab and start a program to see its workout days here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={type.screenTitle}>Log</Text>
          <Text style={styles.subtitle}>{activeProgram.name}</Text>
        </View>

        {todaysDay && <View style={styles.section}>
          <Text style={type.eyebrow}>UP NEXT</Text>
          <Pressable
            accessibilityRole="button"
            style={[styles.dayCard, styles.dayCardToday]}
            onPress={() => navigation.navigate('WorkoutDay', { dayId: todaysDay.id })}
          >
            <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>NEXT WORKOUT</Text></View>
            <Text style={styles.dayName}>{todaysDay.name}</Text>
            <Text style={styles.dayMeta}>{todaysDay.exercises.length} exercises · {todaysDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)} sets</Text>
            <Text style={styles.openText}>Open workout ›</Text>
          </Pressable>
        </View>}

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={type.cardTitle}>Completed workouts</Text><Text style={styles.logCount}>{completedLogs.length}</Text></View>
          {completedLogs.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyBody}>Finished workouts will appear here as saved log cards.</Text></View> :
            <View style={styles.list}>{completedLogs.map((log) => <Pressable
              key={log.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${dayName(log.programId, log.workoutDayId)} workout log`}
              style={styles.logCard}
              onPress={() => navigation.navigate('SessionSummary', { logId: log.id, fromHistory: true })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.dayName}>{dayName(log.programId, log.workoutDayId)}</Text>
                <Text style={styles.dayMeta}>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                <Text style={styles.dayLast}>{log.sets.length} sets · {log.durationMin} min · {log.tonnageKg.toLocaleString()}kg</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>)}</View>}
        </View>
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
  header: {
    gap: 6,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logCount: { fontFamily: fontFamily.mono, fontSize: 11, color: colors.inkFaint },
  list: {
    gap: spacing.md,
    paddingTop: 6,
  },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 4,
  },
  dayCardToday: {
    borderColor: colors.accent,
    backgroundColor: colors.accentWash10,
  },
  logCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyCard: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.hairline, padding: spacing.lg },
  todayBadge: {
    position: 'absolute',
    top: -10,
    left: spacing.lg,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  todayBadgeText: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  dayName: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.ink,
    marginTop: 4,
  },
  dayMeta: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  dayLast: {
    fontFamily: fontFamily.mono,
    fontSize: 11.5,
    color: colors.inkFaint,
    marginTop: 2,
  },
  openText: { fontFamily: fontFamily.semibold, fontSize: 13, color: colors.accentLight, marginTop: spacing.sm },
  chevron: { fontFamily: fontFamily.regular, fontSize: 28, color: colors.inkFaint },
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
