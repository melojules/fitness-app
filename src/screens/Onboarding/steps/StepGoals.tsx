import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing, type } from '../../../theme';
import { GoalGrid } from '../components/GoalGrid';
import { DaysSelector } from '../components/DaysSelector';
import { PillGroup } from '../components/PillGroup';
import { CalculatedCard } from '../components/CalculatedCard';
import { calcBMI, calcBMR, calcCalorieTarget, bmiLabel } from '../calculations';
import type { OnboardingProfile } from '../types';

const EQUIPMENT_OPTIONS = [
  { value: 'full_gym', label: 'Full gym' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'bands', label: 'Bands' },
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'machines', label: 'Machines' },
];

export function StepGoals({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  const bmi = calcBMI(profile.heightCm, profile.weightKg);
  const bmr = calcBMR(profile);
  const target = calcCalorieTarget(bmr, profile.goal);

  function toggleEquipment(value: string) {
    const has = profile.equipment.includes(value);
    onChange({
      equipment: has ? profile.equipment.filter((v) => v !== value) : [...profile.equipment, value],
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goal & schedule</Text>
      <Text style={styles.subtitle}>This shapes which programs we recommend first.</Text>

      <View style={styles.section}>
        <Text style={type.eyebrow}>GOAL</Text>
        <GoalGrid value={profile.goal} onChange={(goal) => onChange({ goal })} />
      </View>

      <View style={styles.section}>
        <Text style={type.eyebrow}>DAYS PER WEEK</Text>
        <DaysSelector value={profile.daysPerWeek} onChange={(daysPerWeek) => onChange({ daysPerWeek })} />
      </View>

      <View style={styles.section}>
        <Text style={type.eyebrow}>EQUIPMENT</Text>
        <PillGroup
          options={EQUIPMENT_OPTIONS}
          selected={profile.equipment}
          onToggle={toggleEquipment}
          multi
        />
      </View>

      <CalculatedCard bmi={bmi} bmiLabel={bmiLabel(bmi)} bmr={bmr} calorieTarget={target} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
    marginTop: -14,
  },
  section: {
    gap: spacing.md,
  },
});
