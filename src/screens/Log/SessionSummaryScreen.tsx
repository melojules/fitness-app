import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Card } from '../../components/Card';
import { useProfile } from '../../state/ProfileContext';
import { getExercise } from '../../data/exerciseLibrary';
import { calcStreak } from '../../logic/streak';
import { prExercisesInLog } from '../../logic/personalRecords';
import type { LogStackParamList, MainTabParamList } from '../../navigation/types';

const FEEL_OPTIONS: { label: string; rpe: number }[] = [
  { label: 'Easy', rpe: 6 },
  { label: 'Just right', rpe: 8 },
  { label: 'Brutal', rpe: 9.5 },
];

export function SessionSummaryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<LogStackParamList>>();
  const route = useRoute<RouteProp<LogStackParamList, 'SessionSummary'>>();
  const { activeProgram, workoutLogs, latestMetrics, updateWorkoutLogFeel } = useProfile();
  const [selectedFeel, setSelectedFeel] = useState<number | null>(null);

  const log = workoutLogs.find((l) => l.id === route.params.logId);
  const day = activeProgram?.days.find((d) => d.id === log?.workoutDayId);
  const streak = calcStreak(workoutLogs);

  const prExercises = useMemo(() => {
    if (!log) return [];
    return prExercisesInLog(log, workoutLogs);
  }, [log, workoutLogs]);

  const estCalories = useMemo(() => {
    if (!log || !latestMetrics) return null;
    const met = 6;
    const kcalPerMin = (met * 3.5 * latestMetrics.weightKg) / 200;
    return Math.round(kcalPerMin * log.durationMin);
  }, [log, latestMetrics]);

  if (!log) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={type.screenTitle}>Session not found</Text>
      </SafeAreaView>
    );
  }

  function handleFeelSelect(rpe: number) {
    setSelectedFeel(rpe);
    updateWorkoutLogFeel(log!.id, rpe);
  }

  function handleDone() {
    if (route.params.fromHistory) {
      navigation.goBack();
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: 'LogHome' }] });
    const parentNav = navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
    parentNav?.navigate('Home');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.heroTitle}>{day?.name ?? 'Workout'}, done.</Text>
          <Text style={styles.heroSubtitle}>Streak → {streak}.</Text>
          <Text style={styles.savedNote}>Saved to your on-device history.</Text>
        </View>

        <View style={styles.statGrid}>
          <StatTile label="Duration" value={`${log.durationMin}m`} />
          <StatTile label="Tonnage" value={`${log.tonnageKg.toLocaleString()}kg`} />
          <StatTile label="Sets logged" value={String(log.sets.length)} />
          <StatTile label="Est. calories" value={estCalories ? `${estCalories}` : '—'} />
        </View>

        {prExercises.length > 0 && (
          <Card style={styles.prCard}>
            <Text style={type.eyebrow}>NEW PR</Text>
            {prExercises.map((pr) => (
              <Text key={pr.exerciseId} style={styles.prText}>
                {getExercise(pr.exerciseId).name} — est. {pr.thisSessionBest}kg 1RM
              </Text>
            ))}
          </Card>
        )}

        <View style={styles.feelBlock}>
          <Text style={type.cardTitle}>How did that feel?</Text>
          <View style={styles.feelRow}>
            {FEEL_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => handleFeelSelect(opt.rpe)}
                style={[styles.feelOption, selectedFeel === opt.rpe && styles.feelOptionActive]}
              >
                <Text style={[styles.feelText, selectedFeel === opt.rpe && styles.feelTextActive]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <PrimaryButton label={route.params.fromHistory ? 'Back to logs' : 'Done'} onPress={handleDone} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.lg,
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59,208,122,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  checkMark: {
    color: colors.positive,
    fontSize: 30,
    fontFamily: fontFamily.bold,
  },
  heroTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  heroSubtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.accentLight,
  },
  savedNote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
    marginTop: 4,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statTile: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 4,
  },
  statValue: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.inkMuted,
  },
  prCard: {
    gap: 6,
  },
  prText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.positive,
  },
  feelBlock: {
    gap: spacing.md,
  },
  feelRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feelOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
  },
  feelOptionActive: {
    backgroundColor: colors.accentWash15,
    borderColor: colors.accent,
  },
  feelText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
  feelTextActive: {
    color: colors.accentLight,
  },
});
