import type { WorkoutLog } from '../models/types';
import { estimateOneRepMax } from '../models/metrics';

// Exercises in `log` whose estimated 1RM beats every log dated strictly before it.
export function prExercisesInLog(log: WorkoutLog, allLogs: WorkoutLog[]) {
  const priorLogs = allLogs.filter((l) => l.id !== log.id && new Date(l.date).getTime() < new Date(log.date).getTime());
  const exerciseIds = [...new Set(log.sets.map((s) => s.exerciseId))];

  return exerciseIds
    .map((exerciseId) => {
      const thisSessionBest = Math.max(
        ...log.sets.filter((s) => s.exerciseId === exerciseId).map((s) => estimateOneRepMax(s.weightKg, s.reps))
      );
      const priorBest = priorLogs
        .flatMap((l) => l.sets.filter((s) => s.exerciseId === exerciseId))
        .reduce((max, s) => Math.max(max, estimateOneRepMax(s.weightKg, s.reps)), 0);
      return { exerciseId, thisSessionBest, isPR: thisSessionBest > priorBest };
    })
    .filter((e) => e.isPR);
}

export function isSessionPR(log: WorkoutLog, allLogs: WorkoutLog[]) {
  return prExercisesInLog(log, allLogs).length > 0;
}
