import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

type PillOption<T extends string> = { value: T; label: string };

export function PillGroup<T extends string>({
  options,
  selected,
  onToggle,
  multi = false,
}: {
  options: PillOption<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  multi?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const active = selected.includes(opt.value);
        return (
          <Pressable key={opt.value} onPress={() => onToggle(opt.value)} style={[styles.pill, active && styles.pillActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pillActive: {
    backgroundColor: colors.accentWash15,
    borderColor: colors.accent,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
  labelActive: {
    color: colors.accentLight,
  },
});
