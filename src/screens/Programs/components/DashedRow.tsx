import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

export function DashedRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.hairline,
    borderRadius: radius.card,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
});
