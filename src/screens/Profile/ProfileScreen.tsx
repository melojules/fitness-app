import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, radius, spacing, type } from '../../theme';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ProfileIcon } from '../../components/TabIcons';
import { useProfile } from '../../state/ProfileContext';
import { useWorkoutSession } from '../../state/WorkoutSessionContext';
import { useToast } from '../../components/Toast';
import { SegmentedToggle } from '../Onboarding/components/SegmentedToggle';
import { NumeralSliderCard } from '../Onboarding/components/NumeralSliderCard';
import { AgeStepper } from '../Onboarding/components/AgeStepper';
import { PillGroup } from '../Onboarding/components/PillGroup';
import { GoalGrid } from '../Onboarding/components/GoalGrid';
import { DaysSelector } from '../Onboarding/components/DaysSelector';
import { RadioCard } from '../Onboarding/components/RadioCard';
import { cmToFeetInches, kgToLb, lbToKg } from '../Onboarding/calculations';
import { bmiLabel } from '../../models/metrics';
import { goalTitle } from '../../logic/programMatching';
import { isLevelCheckInDue, daysSinceLastCheckIn } from '../../logic/levelCheckIn';
import { ConnectionRow } from './components/ConnectionRow';
import type { Experience, Sex } from '../../models/types';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unspecified', label: 'Prefer not to say' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'full_gym', label: 'Full gym' },
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'bands', label: 'Bands' },
  { value: 'bodyweight', label: 'Bodyweight only' },
  { value: 'machines', label: 'Machines' },
];

const LEVELS: { value: Experience; title: string; description: string }[] = [
  { value: 'beginner', title: 'Beginner', description: 'New to training, or 6+ months off.' },
  { value: 'intermediate', title: 'Intermediate', description: '6+ months of consistent training.' },
  { value: 'advanced', title: 'Advanced', description: '2+ years, comfortable with progressive overload.' },
];

export function ProfileScreen() {
  const { profile, latestMetrics, updateProfileFields, updateBodyMetrics, updateExperience, deleteAllProgress } = useProfile();
  const { resetSession } = useWorkoutSession();
  const { showToast } = useToast();
  const [checkInDismissed, setCheckInDismissed] = useState(false);
  const [checkInExpanded, setCheckInExpanded] = useState(false);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [heightDraft, setHeightDraft] = useState(latestMetrics?.heightCm ?? 175);
  const [weightDraft, setWeightDraft] = useState(latestMetrics?.weightKg ?? 78);

  if (!profile || !latestMetrics) return null;

  const checkInDue = isLevelCheckInDue(profile) && !checkInDismissed;

  const heightText =
    profile.units === 'metric'
      ? `${Math.round(heightDraft)} cm`
      : (() => {
          const { feet, inches } = cmToFeetInches(heightDraft);
          return `${feet}'${inches}"`;
        })();
  const weightText = profile.units === 'metric' ? `${Math.round(weightDraft)} kg` : `${kgToLb(weightDraft)} lb`;

  function commitBodyMetrics(height: number, weight: number) {
    updateBodyMetrics(height, weight);
    showToast('Body metrics updated');
  }

  function handleReEvaluate(level: Experience) {
    updateExperience(level);
    setCheckInExpanded(false);
    setCheckInDismissed(true);
    showToast(`Experience level set to ${level}`);
  }

  function confirmDeleteAllProgress() {
    setDeleteConfirmationVisible(false);
    resetSession();
    deleteAllProgress();
    showToast('All progress deleted');
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <ProfileIcon color={colors.inkMuted} size={28} />
          </View>
          <View>
            <Text style={type.screenTitle}>Your profile</Text>
            <Text style={styles.subtitle}>
              {profile.experience} · {goalTitle(profile.goal)}
            </Text>
          </View>
        </View>

        {checkInDue && (
          <Card style={styles.checkInCard}>
            <Text style={type.eyebrow}>LEVEL CHECK-IN</Text>
            <Text style={styles.checkInBody}>
              It's been {daysSinceLastCheckIn(profile)} days since your last level check-in. Still feel like a{' '}
              {profile.experience}?
            </Text>
            {checkInExpanded ? (
              <View style={styles.levelList}>
                {LEVELS.map((level) => (
                  <RadioCard
                    key={level.value}
                    title={level.title}
                    description={level.description}
                    selected={profile.experience === level.value}
                    onPress={() => handleReEvaluate(level.value)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.checkInActions}>
                <PrimaryButton label="Re-evaluate" onPress={() => setCheckInExpanded(true)} style={styles.checkInButton} />
                <PrimaryButton
                  label="Remind me later"
                  variant="outline"
                  onPress={() => setCheckInDismissed(true)}
                  style={styles.checkInButton}
                />
              </View>
            )}
          </Card>
        )}

        <View style={styles.section}>
          <Text style={type.eyebrow}>UNITS</Text>
          <SegmentedToggle
            options={[
              { value: 'metric', label: 'Metric' },
              { value: 'imperial', label: 'Imperial' },
            ]}
            value={profile.units}
            onChange={(units) => updateProfileFields({ units })}
          />
        </View>

        <View style={styles.row}>
          <NumeralSliderCard
            label="Height"
            valueText={heightText}
            value={heightDraft}
            minimumValue={140}
            maximumValue={210}
            onValueChange={setHeightDraft}
            onSlidingComplete={(h) => commitBodyMetrics(h, weightDraft)}
          />
          <NumeralSliderCard
            label="Weight"
            valueText={weightText}
            value={profile.units === 'metric' ? weightDraft : kgToLb(weightDraft)}
            minimumValue={profile.units === 'metric' ? 40 : 88}
            maximumValue={profile.units === 'metric' ? 160 : 352}
            onValueChange={(v) => setWeightDraft(profile.units === 'metric' ? v : lbToKg(v))}
            onSlidingComplete={(v) => {
              const kg = profile.units === 'metric' ? v : lbToKg(v);
              commitBodyMetrics(heightDraft, kg);
            }}
          />
        </View>

        <View style={styles.row}>
          <AgeStepper value={profile.age} onChange={(age) => updateProfileFields({ age })} />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>SEX</Text>
          <PillGroup options={SEX_OPTIONS} selected={[profile.sex]} onToggle={(sex) => updateProfileFields({ sex })} />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>GOAL</Text>
          <GoalGrid value={profile.goal} onChange={(goal) => updateProfileFields({ goal })} />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>DAYS PER WEEK</Text>
          <DaysSelector value={profile.daysPerWeek} onChange={(daysPerWeek) => updateProfileFields({ daysPerWeek })} />
        </View>

        <View style={styles.section}>
          <Text style={type.eyebrow}>EQUIPMENT</Text>
          <PillGroup
            options={EQUIPMENT_OPTIONS}
            selected={profile.equipment}
            onToggle={(value) => {
              const has = profile.equipment.includes(value);
              updateProfileFields({
                equipment: has ? profile.equipment.filter((v) => v !== value) : [...profile.equipment, value],
              });
            }}
            multi
          />
        </View>

        <View style={styles.metricRow}>
          <Card style={styles.metricCard}>
            <Text style={type.eyebrow}>BMI</Text>
            <Text style={styles.metricValue}>{latestMetrics.bmi.toFixed(1)}</Text>
            <Text style={styles.metricSub}>{bmiLabel(latestMetrics.bmi)}</Text>
          </Card>
          <Card style={styles.metricCard}>
            <Text style={type.eyebrow}>BMR · TARGET</Text>
            <Text style={styles.metricValue}>{latestMetrics.bmr}</Text>
            <Text style={styles.metricSub}>{latestMetrics.calorieTarget} kcal target</Text>
          </Card>
        </View>
        <Text style={styles.caveat}>
          BMI is a rough screening number, not a diagnosis. Every edit here is timestamped into your history.
        </Text>

        <Card style={styles.connectionsCard}>
          <Text style={type.eyebrow}>ON THIS DEVICE</Text>
          <Text style={styles.caveat}>Your profile, workouts, body metrics, and nutrition log are stored locally. No account or cloud sign-in is required.</Text>
          <ConnectionRow label="Apple Health" status="Requires a native iOS build" />
          <ConnectionRow label="Apple Watch" status="Requires a native iOS build" />
        </Card>

        <Card style={styles.dangerCard}>
          <Text style={styles.dangerEyebrow}>DANGER ZONE</Text>
          <Text style={styles.dangerTitle}>Delete all progress</Text>
          <Text style={styles.dangerBody}>
            Removes workout history, food logs, custom programs, custom exercises, and any workout in progress. Your profile and latest body measurements stay.
          </Text>
          <PrimaryButton label="Delete all progress" variant="danger" onPress={() => setDeleteConfirmationVisible(true)} />
        </Card>
      </ScrollView>

      <Modal
        visible={deleteConfirmationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteConfirmationVisible(false)}
        accessibilityViewIsModal
      >
        <View style={styles.modalScrim}>
          <View style={styles.confirmationSheet} accessibilityRole="alert">
            <Text style={styles.confirmationEyebrow}>PERMANENT ACTION</Text>
            <Text style={styles.confirmationTitle}>Delete all progress?</Text>
            <Text style={styles.confirmationBody}>
              This removes your workout history, food log, custom programs, custom exercises, and current workout. Your profile and latest body measurements will stay.
            </Text>
            <View style={styles.confirmationActions}>
              <PrimaryButton
                label="Cancel"
                variant="outline"
                style={styles.confirmationButton}
                onPress={() => setDeleteConfirmationVisible(false)}
              />
              <PrimaryButton
                label="Delete progress"
                variant="danger"
                style={styles.confirmationButton}
                onPress={confirmDeleteAllProgress}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    color: colors.inkMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  checkInCard: {
    gap: spacing.md,
  },
  checkInBody: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  checkInActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkInButton: {
    flex: 1,
    height: 46,
  },
  levelList: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 11.5,
    color: colors.inkMuted,
  },
  caveat: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: colors.inkFaint,
    marginTop: -8,
  },
  connectionsCard: {
    gap: 2,
  },
  dangerCard: {
    gap: spacing.md,
    borderColor: 'rgba(255,69,58,.35)',
  },
  dangerEyebrow: {
    ...type.eyebrow,
    color: colors.live,
  },
  dangerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.ink,
  },
  dangerBody: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 20,
    color: colors.inkMuted,
  },
  modalScrim: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,.72)',
  },
  confirmationSheet: {
    gap: spacing.md,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surfaceRaised,
  },
  confirmationEyebrow: {
    ...type.eyebrow,
    color: colors.live,
  },
  confirmationTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  confirmationBody: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  confirmationActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  confirmationButton: {
    flex: 1,
  },
});
