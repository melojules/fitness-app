import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';
import { RadioCard } from '../components/RadioCard';
import type { Experience, OnboardingProfile } from '../types';

const LEVELS: { value: Experience; title: string; description: string }[] = [
  {
    value: 'beginner',
    title: 'Beginner',
    description: 'New to training, or 6+ months off.',
  },
  {
    value: 'intermediate',
    title: 'Intermediate',
    description: '6+ months of consistent training.',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: '2+ years, comfortable with progressive overload.',
  },
];

export function StepExperience({
  profile,
  onChange,
}: {
  profile: OnboardingProfile;
  onChange: (patch: Partial<OnboardingProfile>) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your experience</Text>
      <Text style={styles.subtitle}>Pick whichever fits best — you can always adjust this later.</Text>

      <View style={styles.list}>
        {LEVELS.map((level) => (
          <RadioCard
            key={level.value}
            title={level.title}
            description={level.description}
            selected={profile.experience === level.value}
            onPress={() => onChange({ experience: level.value })}
          />
        ))}
      </View>

      <Text style={styles.footnote}>
        We'll check in after 8–12 weeks to see if your level should change.
      </Text>
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
  list: {
    gap: spacing.md,
  },
  footnote: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.inkFaint,
  },
});
