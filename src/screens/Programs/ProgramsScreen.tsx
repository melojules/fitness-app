import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontFamily, spacing, type } from '../../theme';
import { useProfile } from '../../state/ProfileContext';
import { useToast } from '../../components/Toast';
import { matchPrograms, goalTitle } from '../../logic/programMatching';
import { BestMatchCard } from './components/BestMatchCard';
import { RunnerUpCard } from './components/RunnerUpCard';
import { DashedRow } from './components/DashedRow';
import type { MainTabParamList, ProgramsStackParamList } from '../../navigation/types';

export function ProgramsScreen() {
  const { profile, programs, setActiveProgram } = useProfile();
  const { showToast } = useToast();
  const navigation = useNavigation<NativeStackNavigationProp<ProgramsStackParamList>>();
  const [showAll, setShowAll] = useState(false);

  const matches = useMemo(() => {
    if (!profile) return [];
    return matchPrograms(
      {
        experience: profile.experience,
        goal: profile.goal,
        daysPerWeek: profile.daysPerWeek,
        equipment: profile.equipment,
      },
      programs
    );
  }, [profile, programs]);

  if (!profile || matches.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Text style={type.screenTitle}>Programs</Text>
      </SafeAreaView>
    );
  }

  const [best, ...rest] = matches;
  const runnerUps = showAll ? rest : rest.slice(0, 3);

  function handleStart(programId: string, programName: string) {
    setActiveProgram(programId);
    showToast(`${programName} is now active`);
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>()?.navigate('Log');
  }

  function handleBuildOwn() {
    navigation.navigate('CustomBuilder', undefined);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={type.screenTitle}>Programs</Text>
          <Text style={styles.subtitle}>
            Matched to {profile.experience} · {goalTitle(profile.goal)} · {profile.daysPerWeek} days/week
          </Text>
        </View>

        <BestMatchCard match={best} onStart={() => handleStart(best.program.id, best.program.name)} />

        {runnerUps.length > 0 && (
          <View style={styles.section}>
            <Text style={type.cardTitle}>Other options</Text>
            <View style={styles.runnerUpList}>
              {runnerUps.map((match) => (
                <RunnerUpCard key={match.program.id} match={match} onSelect={() => handleStart(match.program.id, match.program.name)} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.escapeHatches}>
          {!showAll && rest.length > 3 && (
            <DashedRow label="Browse all programs" onPress={() => setShowAll(true)} />
          )}
          <DashedRow label="Build your own program" onPress={handleBuildOwn} />
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
  section: {
    gap: spacing.md,
  },
  runnerUpList: {
    gap: spacing.md,
  },
  escapeHatches: {
    gap: spacing.md,
  },
});
