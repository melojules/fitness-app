import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';

export function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);

  return (
    <View style={styles.row}>
      {values.map((v, i) => {
        const isLast = i === values.length - 1;
        const heightPct = Math.max(6, (v / max) * 100);
        return (
          <View key={i} style={styles.barCol}>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  { height: `${heightPct}%`, backgroundColor: isLast ? colors.accent : colors.surfaceAlt2 },
                ]}
              />
            </View>
          </View>
        );
      })}
      {values.length === 0 && <Text style={styles.empty}>No sessions logged yet</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 90,
  },
  barCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  track: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: radius.chip / 2,
    minHeight: 4,
  },
  empty: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.inkFaint,
  },
});
