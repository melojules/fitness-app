import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, spacing } from '../../theme';
import type { RecentSession } from './types';

export function SessionRow({ session, isLast }: { session: RecentSession; isLast?: boolean }) {
  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.dayName}>{session.dayName}</Text>
          {session.isPR && (
            <View style={styles.prBadge}>
              <Text style={styles.prText}>PR</Text>
            </View>
          )}
        </View>
        <Text style={styles.date}>{session.date}</Text>
      </View>
      <View style={styles.metrics}>
        <Text style={styles.metricValue}>{session.durationMin}m</Text>
        <Text style={styles.metricSub}>{session.tonnageKg.toLocaleString()}kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  info: {
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontFamily: fontFamily.semibold,
    fontSize: 14.5,
    color: colors.ink,
  },
  date: {
    fontFamily: fontFamily.medium,
    fontSize: 12.5,
    color: colors.inkFaint,
  },
  prBadge: {
    backgroundColor: 'rgba(59,208,122,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prText: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: colors.positive,
  },
  metrics: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metricValue: {
    fontFamily: fontFamily.mono,
    fontSize: 13.5,
    color: colors.ink,
  },
  metricSub: {
    fontFamily: fontFamily.mono,
    fontSize: 11.5,
    color: colors.inkFaint,
  },
});
