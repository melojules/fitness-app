import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius } from '../../../theme';

type Option<T extends string> = { value: T; label: string };

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.field,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.field - 3,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13.5,
    color: colors.inkMuted,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
