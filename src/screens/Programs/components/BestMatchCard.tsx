import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { getExercise } from '../../../data/exerciseLibrary';
import type { ProgramMatch } from '../../../models/types';

export function BestMatchCard({ match, onStart }: { match: ProgramMatch; onStart: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { program, score, reasons } = match;

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>BEST MATCH · {score}%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.name}>{program.name}</Text>
        <Text style={styles.description}>{program.description}</Text>

        <View style={styles.reasons}>
          {reasons.map((reason, i) => (
            <View key={i} style={styles.reasonRow}>
              <View style={styles.reasonDot} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>{program.daysPerWeek} days/week</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{program.days.length} workout day{program.days.length > 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Start this program" onPress={onStart} style={styles.startButton} />
          <Pressable onPress={() => setExpanded((v) => !v)} style={styles.detailsButton}>
            <Text style={styles.detailsText}>{expanded ? 'Hide workout days' : 'See workout days'}</Text>
          </Pressable>
        </View>

        {expanded && (
          <View style={styles.dayList}>
            {program.days.map((d) => (
              <View key={d.id} style={styles.dayRow}>
                <Text style={styles.dayName}>{d.name}</Text>
                <Text style={styles.dayExercises}>
                  {d.exercises.map((e) => getExercise(e.exerciseId).name).join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
  },
  badge: {
    position: 'absolute',
    top: -12,
    left: spacing.lg,
    zIndex: 1,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.accent,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.ink,
  },
  description: {
    fontFamily: fontFamily.medium,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.inkMuted,
    marginTop: -6,
  },
  reasons: {
    gap: 6,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reasonDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.positive,
  },
  reasonText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    fontFamily: fontFamily.mono,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
  metaDot: {
    color: colors.inkFaint,
    fontSize: 11.5,
  },
  actions: {
    gap: spacing.sm,
    marginTop: 4,
  },
  startButton: {
    height: 50,
  },
  detailsButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailsText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.accentLight,
  },
  dayList: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  dayRow: {
    gap: 2,
  },
  dayName: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.ink,
  },
  dayExercises: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.inkFaint,
  },
});
