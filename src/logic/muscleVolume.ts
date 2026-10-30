import { getExercise } from '../data/exerciseLibrary';
import type { MuscleGroup, WorkoutDay } from '../models/types';

export type MuscleVolume = {
  muscle: MuscleGroup;
  share: number;
  isPrimary: boolean;
};

const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  core: 'Core',
  full_body: 'Full Body',
};

export function muscleLabel(muscle: MuscleGroup) {
  return MUSCLE_LABELS[muscle];
}

export function aggregateMuscleVolume(day: WorkoutDay): MuscleVolume[] {
  const weight = new Map<MuscleGroup, number>();
  const primary = new Set<MuscleGroup>();

  for (const programExercise of day.exercises) {
    const exercise = getExercise(programExercise.exerciseId);
    const setCount = programExercise.sets;
    for (const muscle of exercise.primaryMuscles) {
      weight.set(muscle, (weight.get(muscle) ?? 0) + setCount);
      primary.add(muscle);
    }
    for (const muscle of exercise.secondaryMuscles) {
      weight.set(muscle, (weight.get(muscle) ?? 0) + setCount * 0.5);
    }
  }

  const total = [...weight.values()].reduce((sum, v) => sum + v, 0) || 1;

  return [...weight.entries()]
    .map(([muscle, w]) => ({ muscle, share: w / total, isPrimary: primary.has(muscle) }))
    .sort((a, b) => b.share - a.share);
}
