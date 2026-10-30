import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, spacing, type } from '../theme';

export function ScreenPlaceholder({ title, note }: { title: string; note?: string }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={type.screenTitle}>{title}</Text>
      <Text style={styles.note}>{note ?? 'Coming next.'}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  note: {
    fontFamily: fontFamily.medium,
    fontSize: 14.5,
    color: colors.inkMuted,
  },
});
