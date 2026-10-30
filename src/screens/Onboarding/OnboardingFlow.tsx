import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepProgress } from './components/StepProgress';
import { StepBodyUnits } from './steps/StepBodyUnits';
import { StepExperience } from './steps/StepExperience';
import { StepGoals } from './steps/StepGoals';
import { defaultProfile, type OnboardingProfile } from './types';

const TOTAL_STEPS = 3;

export function OnboardingFlow({ onComplete }: { onComplete: (profile: OnboardingProfile) => void }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<OnboardingProfile>(defaultProfile);

  function patch(update: Partial<OnboardingProfile>) {
    setProfile((prev) => ({ ...prev, ...update }));
  }

  const canContinue = step === 2 ? profile.experience !== null : step === 3 ? profile.goal !== null : true;

  function handleContinue() {
    if (!canContinue) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      onComplete(profile);
    }
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {step > 1 ? (
          <Pressable onPress={handleBack} hitSlop={12} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressWrap}>
          <StepProgress step={step} total={TOTAL_STEPS} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && <StepBodyUnits profile={profile} onChange={patch} />}
        {step === 2 && <StepExperience profile={profile} onChange={patch} />}
        {step === 3 && <StepGoals profile={profile} onChange={patch} />}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={step === TOTAL_STEPS ? 'See my programs' : 'Continue'}
          onPress={handleContinue}
          style={!canContinue ? styles.disabled : undefined}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.onboardingGutter,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  backButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.ink,
    marginTop: -3,
  },
  progressWrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.onboardingGutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  footer: {
    paddingHorizontal: spacing.onboardingGutter,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});
