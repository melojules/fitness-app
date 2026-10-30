import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

type NumeralSliderCardProps = {
  label: string;
  valueText: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
};

export function NumeralSliderCard({
  label,
  valueText,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  onSlidingComplete,
}: NumeralSliderCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{label}</Text>
      <Text style={styles.numeral}>{valueText}</Text>
      <Slider
        value={value}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.surfaceAlt2}
        thumbTintColor={colors.accent}
        style={styles.slider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: spacing.lg,
    gap: 4,
  },
  eyebrow: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.inkFaint,
    textTransform: 'uppercase',
  },
  numeral: {
    fontFamily: fontFamily.extrabold,
    fontSize: 32,
    letterSpacing: -1,
    color: colors.ink,
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 32,
  },
});
