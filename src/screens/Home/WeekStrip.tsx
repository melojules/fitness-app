import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily } from '../../theme';
import type { WeekDay } from './types';

function DayDot({ day }: { day: WeekDay }) {
  if (day.status === 'completed') {
    return (
      <View style={[styles.dot, styles.dotCompleted]}>
        <Text style={styles.check}>✓</Text>
      </View>
    );
  }
  if (day.status === 'today') {
    return (
      <View style={[styles.dot, styles.dotToday]}>
        <Text style={styles.dateTodayText}>{day.date}</Text>
      </View>
    );
  }
  if (day.status === 'rest') {
    return (
      <View style={[styles.dot, styles.dotRest]}>
        <Text style={styles.dateFaintText}>{day.date}</Text>
      </View>
    );
  }
  return (
    <View style={styles.dot}>
      <Text style={styles.dateText}>{day.date}</Text>
    </View>
  );
}

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <View style={styles.row}>
      {days.map((day, i) => (
        <View key={i} style={styles.col}>
          <Text style={styles.label}>{day.label}</Text>
          <DayDot day={day} />
        </View>
      ))}
    </View>
  );
}

const DOT_SIZE = 34;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.inkFaint,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  dotCompleted: {
    backgroundColor: colors.accent,
  },
  dotToday: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  dotRest: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderStyle: 'dashed',
  },
  check: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFamily.bold,
  },
  dateText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12.5,
    color: colors.inkMuted,
  },
  dateTodayText: {
    fontFamily: fontFamily.bold,
    fontSize: 12.5,
    color: colors.accentLight,
  },
  dateFaintText: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
});
