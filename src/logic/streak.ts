import type { WorkoutLog } from '../models/types';

// Local calendar-day key (not UTC — toISOString() would shift the date near local midnight
// for any timezone not exactly UTC, which previously made a same-day log miss the streak).
function toDayKey(date: Date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calcStreak(logs: WorkoutLog[]): number {
  if (logs.length === 0) return 0;
  const days = new Set(logs.map((l) => toDayKey(new Date(l.date))));

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  if (!days.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toDayKey(cursor))) return 0;
  }

  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
