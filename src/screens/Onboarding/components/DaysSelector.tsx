import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../../theme';

const DAYS = [2, 3, 4, 5, 6];

export function DaysSelector({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return (
    <View style={styles.row}>
      {DAYS.map((day) => {
        const active = day === value;
        return (
          <Pressable key={day} onPress={() => onChange(day)} style={[styles.circle, active && styles.circleActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{day}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const SIZE = 52;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.inkMuted,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
