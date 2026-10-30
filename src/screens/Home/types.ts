// View-model types for the Home screen's cards — populated from real ProfileContext
// data in HomeScreen.tsx.

export type WeekDay = {
  label: string;
  date: number;
  status: 'completed' | 'today' | 'rest' | 'upcoming';
};

export type TodayWorkoutSummary = {
  dayName: string;
  exerciseCount: number;
  setCount: number;
  estMinutes: number;
};

export type RecentSession = {
  id: string;
  dayName: string;
  date: string;
  durationMin: number;
  tonnageKg: number;
  isPR: boolean;
};
