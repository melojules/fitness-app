import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, radius, spacing } from '../../../theme';
import { muscleLabel, type MuscleVolume } from '../../../logic/muscleVolume';

function BarRow({ volume, index }: { volume: MuscleVolume; index: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: volume.share,
      duration: 500,
      delay: index * 100,
      useNativeDriver: false,
    }).start();
  }, [width, volume.share, index]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{muscleLabel(volume.muscle)}</Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: volume.isPrimary ? colors.accent : colors.accentLight,
              width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
      <Text style={styles.pct}>{Math.round(volume.share * 100)}%</Text>
    </View>
  );
}

export function MuscleVolumeBars({ volumes }: { volumes: MuscleVolume[] }) {
  return (
    <View style={styles.list}>
      {volumes.map((v, i) => (
        <BarRow key={v.muscle} volume={v} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkMuted,
    width: 78,
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  pct: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    color: colors.inkFaint,
    width: 32,
    textAlign: 'right',
  },
});
