import Svg, { Polyline } from 'react-native-svg';
import { colors } from '../theme';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
};

export function Sparkline({ data, width = 88, height = 32, color = colors.accentLight }: SparklineProps) {
  if (data.length === 0) {
    return <Svg width={width} height={height} />;
  }

  if (data.length === 1) {
    const y = height / 2;
    return (
      <Svg width={width} height={height}>
        <Polyline points={`0,${y} ${width},${y}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
