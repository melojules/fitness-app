// Shared body-metric math — see uploads/fitness-app-prompt.md §3, §7
import type { Goal, Sex } from '../screens/Onboarding/types';

export function calcBMI(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Below range';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Above range';
  return 'Well above range';
}

export function calcBMR({ heightCm, weightKg, age, sex }: { heightCm: number; weightKg: number; age: number; sex: Sex }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === 'male') return Math.round(base + 5);
  if (sex === 'female') return Math.round(base - 161);
  return Math.round(base - 78);
}

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose_weight: -0.15,
  build_muscle: 0.1,
  endurance: 0.05,
  general_health: 0,
};

export function calcCalorieTarget(bmr: number, goal: Goal | null) {
  const activityFactor = 1.5;
  const maintenance = bmr * activityFactor;
  const adjustment = goal ? GOAL_ADJUSTMENT[goal] : 0;
  return Math.round(maintenance * (1 + adjustment));
}

export function estimateOneRepMax(weightKg: number, reps: number) {
  if (reps <= 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30));
}
