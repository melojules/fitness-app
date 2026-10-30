import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import type { HomeStackParamList, MainTabParamList } from '../../navigation/types';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Sparkline } from '../../components/Sparkline';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useProfile } from '../../state/ProfileContext';
import { calcStreak } from '../../logic/streak';
import { isSessionPR } from '../../logic/personalRecords';
import { getTodaysDay } from '../../logic/workoutRotation';
import { bmiLabel } from '../../models/metrics';
import { HeroCard } from './HeroCard';
import { WeekStrip } from './WeekStrip';
import { SessionRow } from './SessionRow';
import type { WeekDay } from './types';

const today = new Date();
const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function greeting() {
  const hour = today.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function sameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function HomeScreen() {
  const navigation = useNavigation<CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackParamList, 'HomeDashboard'>,
    BottomTabNavigationProp<MainTabParamList>
  >>();
  const { profile, activeProgram, programs, workoutLogs, latestMetrics, foodEntries } = useProfile();

  const streak = calcStreak(workoutLogs);

  const programLogs = useMemo(
    () => (activeProgram ? workoutLogs.filter((l) => l.programId === activeProgram.id) : []),
    [workoutLogs, activeProgram]
  );

  const todayDay = useMemo(() => {
    if (!activeProgram) return null;
    return getTodaysDay(activeProgram, programLogs);
  }, [activeProgram, programLogs]);

  const todayWorkout = useMemo(() => {
    if (!todayDay) return null;
    const setCount = todayDay.exercises.reduce((sum, e) => sum + e.sets, 0);
    const estMinutes = Math.round(todayDay.exercises.reduce((sum, e) => sum + e.sets * (e.restSec + 45), 0) / 60);
    return { dayName: todayDay.name, exerciseCount: todayDay.exercises.length, setCount, estMinutes };
  }, [todayDay]);

  const weekStrip: WeekDay[] = useMemo(() => {
    const days: WeekDay[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - offset);
      const hasLog = workoutLogs.some((log) => sameCalendarDay(new Date(log.date), date));
      const isToday = sameCalendarDay(date, today);
      days.push({
        label: DAY_LABELS[date.getDay()],
        date: date.getDate(),
        status: hasLog ? 'completed' : isToday ? 'today' : 'upcoming',
      });
    }
    return days;
  }, [workoutLogs]);

  const weightSparkline = useMemo(() => {
    if (!profile) return [];
    return profile.metricsHistory.slice(-8).map((m) => m.weightKg);
  }, [profile]);

  const weightDelta = useMemo(() => {
    if (!profile || profile.metricsHistory.length < 2) return null;
    const current = profile.metricsHistory[profile.metricsHistory.length - 1];
    const cutoff = new Date(current.timestamp).getTime() - 28 * 24 * 60 * 60 * 1000;
    const reference =
      [...profile.metricsHistory].reverse().find((m) => new Date(m.timestamp).getTime() <= cutoff) ??
      profile.metricsHistory[0];
    return Math.round((current.weightKg - reference.weightKg) * 10) / 10;
  }, [profile]);

  const recentSessions = useMemo(() => {
    return [...workoutLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((log) => {
        const program = programs.find((p) => p.id === log.programId);
        const dayName = program?.days.find((d) => d.id === log.workoutDayId)?.name ?? 'Workout';
        return {
          id: log.id,
          dayName,
          date: new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          durationMin: log.durationMin,
          tonnageKg: log.tonnageKg,
          isPR: isSessionPR(log, workoutLogs),
        };
      });
  }, [workoutLogs, programs]);

  const todayFood = useMemo(() => {
    const now = new Date();
    return foodEntries.filter((entry) => {
      const date = new Date(entry.loggedAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    });
  }, [foodEntries]);
  const caloriesLogged = todayFood.reduce((sum, entry) => sum + entry.calories, 0);

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.date}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.chipsRow}>
          <Chip tone="accent" label={`${streak}-day streak`} />
          {activeProgram && <Chip tone="neutral" label={activeProgram.name} />}
        </View>

        {activeProgram && todayWorkout ? (
          <HeroCard
            today={todayWorkout}
            onOpenWorkout={() =>
              navigation.navigate('Log', { screen: 'WorkoutDay', params: { dayId: todayDay!.id } })
            }
          />
        ) : (
          <Card style={styles.noProgramCard}>
            <Text style={type.cardTitle}>No active program</Text>
            <Text style={styles.noProgramBody}>
              Pick a program to get a recommended workout for today.
            </Text>
            <PrimaryButton label="Browse programs" onPress={() => navigation.navigate('Programs')} />
          </Card>
        )}

        <Card>
          <WeekStrip days={weekStrip} />
        </Card>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <Text style={type.eyebrow}>BODY WEIGHT</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestMetrics?.weightKg.toFixed(1)}</Text>
              <Text style={styles.metricUnit}>kg</Text>
            </View>
            <Sparkline data={weightSparkline} width={100} />
            {weightDelta !== null && (
              <Text style={styles.deltaText}>
                {weightDelta > 0 ? '+' : ''}
                {weightDelta}kg / 4wk
              </Text>
            )}
          </Card>
          <Card style={styles.metricCard}>
            <Text style={type.eyebrow}>BMI · BMR</Text>
            <View style={styles.metricValueRow}>
              <Text style={styles.metricValue}>{latestMetrics?.bmi.toFixed(1)}</Text>
            </View>
            <Text style={styles.deltaText}>{latestMetrics ? bmiLabel(latestMetrics.bmi) : ''}</Text>
            <Text style={styles.bmrText}>
              {latestMetrics?.bmr} kcal BMR · {latestMetrics?.calorieTarget} target
            </Text>
          </Card>
        </View>

        <Card style={styles.nutritionCard}>
          <View style={{ flex: 1 }}>
            <Text style={type.eyebrow}>TODAY'S NUTRITION</Text>
            <Text style={styles.nutritionValue}>{Math.round(caloriesLogged)} <Text style={styles.metricUnit}>kcal</Text></Text>
            <Text style={styles.noProgramBody}>{todayFood.length ? `${todayFood.length} item${todayFood.length === 1 ? '' : 's'} logged` : 'No food logged yet'}</Text>
          </View>
          <PrimaryButton label="Open food log" variant="outline" style={styles.nutritionButton} onPress={() => navigation.navigate('Nutrition')} />
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={type.cardTitle}>Recent sessions</Text>
        </View>
        {recentSessions.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Finish a workout and it'll show up here.</Text>
          </Card>
        ) : (
          <Card padded={false} style={styles.sessionsCard}>
            <View style={{ paddingHorizontal: spacing.lg }}>
              {recentSessions.map((session, i) => (
                <SessionRow key={session.id} session={session} isLast={i === recentSessions.length - 1} />
              ))}
            </View>
          </Card>
        )}
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
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  date: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkMuted,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  noProgramCard: {
    gap: spacing.md,
  },
  noProgramBody: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: -6,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: 8,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  metricValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  metricUnit: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.inkMuted,
  },
  deltaText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.positive,
  },
  bmrText: {
    fontFamily: fontFamily.medium,
    fontSize: 11.5,
    color: colors.inkFaint,
    marginTop: 2,
  },
  nutritionCard: { gap: spacing.md },
  nutritionValue: { color: colors.ink, fontFamily: fontFamily.extrabold, fontSize: 28, letterSpacing: -0.8, marginTop: 6 },
  nutritionButton: { height: 48 },
  sectionHeader: {
    marginTop: spacing.xs,
  },
  sessionsCard: {
    paddingVertical: 4,
    borderRadius: radius.card,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
});
