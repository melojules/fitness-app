import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, spacing } from '../theme';

type CardProps = ViewProps & {
  raised?: boolean;
  padded?: boolean;
};

export function Card({ style, raised, padded = true, ...rest }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { backgroundColor: raised ? colors.surfaceRaised : colors.surface },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  padded: {
    padding: spacing.lg,
  },
});
