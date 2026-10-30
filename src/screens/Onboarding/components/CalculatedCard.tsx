import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

type CalculatedCardProps = {
  bmi: number;
  bmiLabel: string;
  bmr: number;
  calorieTarget: number;
};

export function CalculatedCard({ bmi, bmiLabel, bmr, calorieTarget }: CalculatedCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>CALCULATED FROM YOUR PROFILE</Text>
      <View style={styles.row}>
        <Metric value={bmi.toFixed(1)} label="BMI" sub={bmiLabel} />
        <View style={styles.divider} />
        <Metric value={bmr.toString()} label="BMR" sub="kcal/day" />
        <View style={styles.divider} />
        <Metric value={calorieTarget.toString()} label="TARGET" sub="kcal/day" />
      </View>
    </View>
  );
}

function Metric({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.accentWash10,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.accentWash20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.accentLight,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  value: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 10.5,
    color: colors.inkMuted,
    marginTop: 2,
  },
  sub: {
    fontFamily: fontFamily.medium,
    fontSize: 10.5,
    color: colors.inkFaint,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.accentWash20,
  },
});
