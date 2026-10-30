import { exerciseLibrary } from '../data/exerciseLibrary';
import type { ExerciseLibraryItem, WorkoutLog } from '../models/types';

export type SwapOption = {
  exercise: ExerciseLibraryItem;
  reason: string;
};

export function findSwapOptions(
  current: ExerciseLibraryItem,
  userEquipment: string[],
  history: WorkoutLog[],
  limit = 4
): SwapOption[] {
  const candidates = exerciseLibrary.filter((e) => {
    if (e.id === current.id) return false;
    const sharesMuscle = e.primaryMuscles.some((m) => current.primaryMuscles.includes(m));
    if (!sharesMuscle) return false;
    const feasible = userEquipment.includes('full_gym') || e.equipment.some((eq) => userEquipment.includes(eq));
    return feasible;
  });

  const scored = candidates.map((exercise) => {
    const history_for_exercise = history.filter((log) => log.sets.some((s) => s.exerciseId === exercise.id));
    let reason: string;
    let priority = 0;

    if (history_for_exercise.length > 0) {
      const lastLog = [...history_for_exercise].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const lastSet = lastLog.sets.filter((s) => s.exerciseId === exercise.id).slice(-1)[0];
      reason = `You've logged this ${history_for_exercise.length} time${history_for_exercise.length > 1 ? 's' : ''} · last ${lastSet.weightKg}kg`;
      priority = 3;
    } else if (exercise.equipment.includes('bodyweight') && !current.equipment.includes('bodyweight')) {
      reason = 'No equipment needed — good if machines are busy';
      priority = 2;
    } else if (!exercise.equipment.some((e) => current.equipment.includes(e))) {
      reason = 'Uses different equipment than your current pick';
      priority = 1;
    } else {
      reason = 'Targets the same muscle group';
      priority = 0;
    }

    return { exercise, reason, priority };
  });

  return scored
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit)
    .map(({ exercise, reason }) => ({ exercise, reason }));
}
