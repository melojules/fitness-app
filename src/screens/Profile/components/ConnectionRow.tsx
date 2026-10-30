import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';

export function ConnectionRow({ label, status }: { label: string; status: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.status}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: colors.ink,
  },
  status: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
});
