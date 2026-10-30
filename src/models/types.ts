// Core data model — see uploads/fitness-app-prompt.md §9
import type { Experience, Goal, Sex, Units } from '../screens/Onboarding/types';

export type { Experience, Goal, Sex, Units };

export type BodyMetricEntry = {
  id: string;
  timestamp: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  bmr: number;
  calorieTarget: number;
};

export type UserProfile = {
  id: string;
  units: Units;
  age: number;
  sex: Sex;
  experience: Experience;
  goal: Goal;
  daysPerWeek: number;
  equipment: string[];
  metricsHistory: BodyMetricEntry[];
  experienceHistory: { timestamp: string; experience: Experience }[];
  createdAt: string;
};

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type FoodEntry = {
  id: string;
  loggedAt: string;
  name: string;
  meal: MealType;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'full_body';

export type Equipment = 'full_gym' | 'dumbbells' | 'barbell' | 'bands' | 'bodyweight' | 'machines';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ExerciseLibraryItem = {
  id: string;
  name: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  cues: string[];
  difficulty: Difficulty;
  demoTempoSec: number;
};

export type ProgramExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
  targetWeightKg?: number;
};

export type WorkoutDay = {
  id: string;
  name: string;
  dayOfWeek?: number;
  exercises: ProgramExercise[];
};

export type Program = {
  id: string;
  name: string;
  source: 'built_in' | 'custom';
  experience: Difficulty[];
  goals: Goal[];
  daysPerWeek: number;
  equipment: Equipment[];
  description: string;
  days: WorkoutDay[];
  archived?: boolean;
};

export type SetLog = {
  id: string;
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number;
};

export type WorkoutLog = {
  id: string;
  programId: string;
  workoutDayId: string;
  date: string;
  durationMin: number;
  sets: SetLog[];
  tonnageKg: number;
  healthKitRef?: string;
};

export type ProgramMatch = {
  program: Program;
  score: number;
  reasons: string[];
};
