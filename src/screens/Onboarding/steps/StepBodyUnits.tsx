import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';
import { SegmentedToggle } from '../components/SegmentedToggle';
import { NumeralSliderCard } from '../components/NumeralSliderCard';
import { AgeStepper } from '../components/AgeStepper';
import { PillGroup } from '../components/PillGroup';
import { cmToFeetInches, kgToLb, lbToKg } from '../calculations';
import type { OnboardingProfile, Sex } from '../types';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unspecified', label: 'Prefer not to say' },
];

export function StepBodyUnits({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  const heightText =
    profile.units === 'metric'
      ? `${Math.round(profile.heightCm)} cm`
      : (() => {
          const { feet, inches } = cmToFeetInches(profile.heightCm);
          return `${feet}'${inches}"`;
        })();

  const weightText =
    profile.units === 'metric' ? `${Math.round(profile.weightKg)} kg` : `${kgToLb(profile.weightKg)} lb`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>About you</Text>
      <Text style={styles.subtitle}>
        Your body measurements and workouts stay on this device. Your account name, email, and access request are stored online.
      </Text>

      <SegmentedToggle
        options={[
          { value: 'metric', label: 'Metric' },
          { value: 'imperial', label: 'Imperial' },
        ]}
        value={profile.units}
        onChange={(units) => onChange({ units })}
      />

      <View style={styles.row}>
        <NumeralSliderCard
          label="Height"
          valueText={heightText}
          value={profile.heightCm}
          minimumValue={140}
          maximumValue={210}
          onValueChange={(heightCm) => onChange({ heightCm })}
        />
        <NumeralSliderCard
          label="Weight"
          valueText={weightText}
          value={profile.units === 'metric' ? profile.weightKg : kgToLb(profile.weightKg)}
          minimumValue={profile.units === 'metric' ? 40 : 88}
          maximumValue={profile.units === 'metric' ? 160 : 352}
          onValueChange={(v) => onChange({ weightKg: profile.units === 'metric' ? v : lbToKg(v) })}
        />
      </View>

      <View style={styles.row}>
        <AgeStepper value={profile.age} onChange={(age) => onChange({ age })} />
      </View>

      <View style={styles.sexBlock}>
        <Text style={styles.sexLabel}>SEX (OPTIONAL)</Text>
        <PillGroup
          options={SEX_OPTIONS}
          selected={[profile.sex]}
          onToggle={(sex) => onChange({ sex })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
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
    marginTop: -8,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sexBlock: {
    gap: spacing.sm,
  },
  sexLabel: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.inkFaint,
  },
});
