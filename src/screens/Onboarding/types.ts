export type Units = 'metric' | 'imperial';
export type Sex = 'male' | 'female' | 'unspecified';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Goal = 'build_muscle' | 'lose_weight' | 'endurance' | 'general_health';

export type OnboardingProfile = {
  units: Units;
  heightCm: number;
  weightKg: number;
  age: number;
  sex: Sex;
  experience: Experience | null;
  goal: Goal | null;
  daysPerWeek: number;
  equipment: string[];
};

export const defaultProfile: OnboardingProfile = {
  units: 'metric',
  heightCm: 175,
  weightKg: 78,
  age: 27,
  sex: 'unspecified',
  experience: null,
  goal: null,
  daysPerWeek: 4,
  equipment: [],
};
