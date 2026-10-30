import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors } from '../../../theme';
import type { MuscleGroup } from '../../../models/types';
import type { MuscleVolume } from '../../../logic/muscleVolume';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

type Region = { x: number; y: number; w: number; h: number; rx: number };

const REGIONS: Partial<Record<MuscleGroup, Region>> = {
  shoulders: { x: 60, y: 46, w: 80, h: 18, rx: 8 },
  chest: { x: 68, y: 64, w: 64, h: 26, rx: 8 },
  back: { x: 70, y: 64, w: 60, h: 40, rx: 8 },
  biceps: { x: 44, y: 66, w: 16, h: 40, rx: 7 },
  triceps: { x: 140, y: 66, w: 16, h: 40, rx: 7 },
  core: { x: 76, y: 92, w: 48, h: 30, rx: 8 },
  glutes: { x: 72, y: 120, w: 56, h: 22, rx: 10 },
  quads: { x: 74, y: 144, w: 24, h: 46, rx: 9 },
  hamstrings: { x: 102, y: 144, w: 24, h: 46, rx: 9 },
  calves: { x: 76, y: 194, w: 48, h: 34, rx: 9 },
  full_body: { x: 60, y: 46, w: 80, h: 182, rx: 12 },
};

function MuscleShape({ muscle, isPrimary }: { muscle: MuscleGroup; isPrimary: boolean }) {
  const region = REGIONS[muscle];
  const opacity = useRef(new Animated.Value(isPrimary ? 0.95 : 0.55)).current;

  useEffect(() => {
    const low = isPrimary ? 0.42 : 0.2;
    const high = isPrimary ? 0.95 : 0.55;
    const delay = isPrimary ? 0 : 300;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: low, duration: 1900, delay, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: high, duration: 1900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, isPrimary]);

  if (!region) return null;

  return (
    <AnimatedRect
      x={region.x}
      y={region.y}
      width={region.w}
      height={region.h}
      rx={region.rx}
      fill={isPrimary ? colors.accent : colors.accentLight}
      opacity={opacity as unknown as number}
    />
  );
}

export function MuscleMap({ volumes }: { volumes: MuscleVolume[] }) {
  return (
    <View style={styles.wrap}>
      <Svg width={160} height={220} viewBox="0 0 200 240">
        <Circle cx={100} cy={26} r={20} fill={colors.surfaceAlt2} />
        <Rect x={70} y={44} width={60} height={150} rx={20} fill={colors.surfaceAlt2} opacity={0.4} />
        {volumes.map((v) => (
          <MuscleShape key={v.muscle} muscle={v.muscle} isPrimary={v.isPrimary} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
