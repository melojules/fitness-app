import type { NavigatorScreenParams } from '@react-navigation/native';

export type LogStackParamList = {
  LogHome: undefined;
  WorkoutDay: { dayId: string };
  ExerciseSwap: { programExerciseId: string };
  LiveWorkout: undefined;
  SessionSummary: { logId: string; fromHistory?: boolean };
};

export type HomeStackParamList = {
  HomeDashboard: undefined;
  Nutrition: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Programs: undefined;
  Log: NavigatorScreenParams<LogStackParamList> | undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
};

export type ProgramsStackParamList = {
  ProgramsHome: undefined;
  CustomBuilder: { programId?: string } | undefined;
};
