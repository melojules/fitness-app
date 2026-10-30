// Exercise recommendation within a workout day — see uploads/fitness-app-prompt.md §5
import type { Experience } from '../screens/Onboarding/types';
import type { ExerciseLibraryItem, MuscleGroup, ProgramExercise, UserProfile, WorkoutLog } from '../models/types';
import { estimateOneRepMax } from '../models/metrics';

export type ExerciseTarget = {
  weightKg: number | null;
  reps: string;
  sets: number;
  restSec: number;
  note: string;
  isBodyweight: boolean;
};

const BODYWEIGHT_MULTIPLIER: Partial<Record<MuscleGroup, number>> = {
  chest: 0.5,
  back: 0.4,
  shoulders: 0.3,
  biceps: 0.15,
  triceps: 0.18,
  quads: 0.75,
  hamstrings: 0.6,
  glutes: 0.9,
  calves: 0.3,
};

const EXPERIENCE_MULTIPLIER: Record<Experience, number> = {
  beginner: 0.7,
  intermediate: 1,
  advanced: 1.3,
};

const UPPER_BODY: MuscleGroup[] = ['chest', 'back', 'shoulders', 'biceps', 'triceps'];

function roundToPlate(weightKg: number) {
  return Math.max(2.5, Math.round(weightKg / 2.5) * 2.5);
}

function findLastLog(exerciseId: string, history: WorkoutLog[]) {
  const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (const log of sorted) {
    const sets = log.sets.filter((s) => s.exerciseId === exerciseId);
    if (sets.length > 0) return { log, sets };
  }
  return null;
}

function startingWeight(exercise: ExerciseLibraryItem, bodyWeightKg: number, experience: Experience) {
  const multiplier = BODYWEIGHT_MULTIPLIER[exercise.primaryMuscles[0]];
  if (multiplier === undefined) return null;
  return roundToPlate(bodyWeightKg * multiplier * EXPERIENCE_MULTIPLIER[experience]);
}

export function suggestExerciseTarget(
  exercise: ExerciseLibraryItem,
  programExercise: ProgramExercise,
  profile: UserProfile,
  bodyWeightKg: number,
  history: WorkoutLog[]
): ExerciseTarget {
  const isBodyweight = exercise.equipment.length === 1 && exercise.equipment[0] === 'bodyweight';
  const last = findLastLog(exercise.id, history);
  const increment = UPPER_BODY.includes(exercise.primaryMuscles[0]) ? 2.5 : 5;

  if (isBodyweight) {
    return {
      weightKg: null,
      reps: programExercise.reps,
      sets: programExercise.sets,
      restSec: programExercise.restSec,
      note: last
        ? `Last time you did ${last.sets[last.sets.length - 1].reps} reps on your final set.`
        : 'No weight needed — focus on full range of motion.',
      isBodyweight: true,
    };
  }

  if (!last) {
    const weight = startingWeight(exercise, bodyWeightKg, profile.experience);
    return {
      weightKg: weight,
      reps: programExercise.reps,
      sets: programExercise.sets,
      restSec: programExercise.restSec,
      note: weight ? 'Estimated starting point — we\'ll adjust after you log this.' : 'Pick a weight that challenges your target reps.',
      isBodyweight: false,
    };
  }

  const targetReps = parseInt(programExercise.reps, 10) || 0;
  const topSet = last.sets.reduce((max, s) => (s.weightKg > max.weightKg ? s : max), last.sets[0]);
  const allSetsHitTarget = last.sets.every((s) => s.reps >= targetReps);
  const feltEasy = last.sets.every((s) => (s.rpe ?? 10) <= 8);

  if (allSetsHitTarget && feltEasy) {
    const nextWeight = roundToPlate(topSet.weightKg + increment);
    return {
      weightKg: nextWeight,
      reps: programExercise.reps,
      sets: programExercise.sets,
      restSec: programExercise.restSec,
      note: `Up from ${topSet.weightKg}kg last session — you hit every rep with room to spare.`,
      isBodyweight: false,
    };
  }

  return {
    weightKg: topSet.weightKg,
    reps: programExercise.reps,
    sets: programExercise.sets,
    restSec: programExercise.restSec,
    note: `Same as last session (${topSet.weightKg}kg) — lock in that rep target before adding weight.`,
    isBodyweight: false,
  };
}

export function estimatedOneRepMaxHistory(exerciseId: string, history: WorkoutLog[]) {
  return [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((log) => {
      const sets = log.sets.filter((s) => s.exerciseId === exerciseId);
      if (sets.length === 0) return null;
      const best = sets.reduce((max, s) => {
        const oneRm = estimateOneRepMax(s.weightKg, s.reps);
        return oneRm > max ? oneRm : max;
      }, 0);
      return { date: log.date, oneRepMax: best };
    })
    .filter((entry): entry is { date: string; oneRepMax: number } => entry !== null);
}
