import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, fontFamily, layout, radius } from '../theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'accent' | 'white' | 'outline' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
};

export function PrimaryButton({ label, onPress, variant = 'accent', style, disabled = false }: PrimaryButtonProps) {
  const variantStyle = {
    accent: { backgroundColor: colors.accent, textColor: '#FFFFFF', borderWidth: 0 },
    white: { backgroundColor: '#FFFFFF', textColor: '#0B0B0D', borderWidth: 0 },
    outline: { backgroundColor: 'transparent', textColor: colors.ink, borderWidth: 1 },
    danger: { backgroundColor: colors.live, textColor: '#FFFFFF', borderWidth: 0 },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: disabled ? colors.surfaceAlt2 : variantStyle.backgroundColor,
          borderWidth: variantStyle.borderWidth,
          borderColor: colors.hairline,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: disabled ? colors.inkMuted : variantStyle.textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.ctaHeight,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
});
