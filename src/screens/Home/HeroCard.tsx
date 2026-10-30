import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, heroGradient, radius, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import type { TodayWorkoutSummary } from './types';

type HeroCardProps = {
  today: TodayWorkoutSummary;
  onOpenWorkout: () => void;
};

export function HeroCard({ today, onOpenWorkout }: HeroCardProps) {
  return (
    <LinearGradient
      colors={heroGradient.colors}
      start={heroGradient.start}
      end={heroGradient.end}
      style={styles.card}
    >
      <Text style={styles.eyebrow}>TODAY'S WORKOUT</Text>
      <Text style={styles.dayName}>{today.dayName}</Text>
      <View style={styles.statsRow}>
        <Stat value={today.exerciseCount} label="exercises" />
        <View style={styles.statDivider} />
        <Stat value={today.setCount} label="sets" />
        <View style={styles.statDivider} />
        <Stat value={today.estMinutes} label="min" />
      </View>
      <PrimaryButton label="Open today's workout" variant="white" onPress={onOpenWorkout} />
    </LinearGradient>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.hero,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.3,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
  },
  dayName: {
    fontFamily: fontFamily.extrabold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: '#FFFFFF',
    marginTop: -6,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
