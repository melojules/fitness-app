import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import type { ProgramMatch } from '../../../models/types';

export function RunnerUpCard({ match, onSelect }: { match: ProgramMatch; onSelect: () => void }) {
  const { program, score, reasons } = match;
  const caveat = reasons.find((r) => r.includes('Tagged') || r.includes("haven't")) ?? reasons[reasons.length - 1];

  return (
    <Pressable onPress={onSelect} style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{program.name}</Text>
        <Text style={styles.score}>{score}%</Text>
      </View>
      {caveat && <Text style={styles.caveat}>{caveat}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 15.5,
    color: colors.ink,
  },
  score: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
    color: colors.inkMuted,
  },
  caveat: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
});
