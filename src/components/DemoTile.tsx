import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

type DemoTileProps = {
  size?: number;
  tempoSec?: number;
};

export function DemoTile({ size = 52, tempoSec = 1.8 }: DemoTileProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: tempoSec * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: tempoSec * 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress, tempoSec]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [size * 0.16, -size * 0.16] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] });

  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            transform: [{ translateY }, { scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.surfaceAlt2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dot: {
    backgroundColor: colors.accent,
  },
});
