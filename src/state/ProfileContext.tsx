import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { calcBMI, calcBMR, calcCalorieTarget } from '../models/metrics';
import type { BodyMetricEntry, Experience, ExerciseLibraryItem, FoodEntry, Program, Sex, UserProfile, WorkoutLog } from '../models/types';
import { programLibrary } from '../data/programLibrary';
import { registerCustomExercise, replaceCustomExercises } from '../data/exerciseLibrary';
import type { OnboardingProfile } from '../screens/Onboarding/types';
import { loadUserData, saveUserData } from '../db/userDataRepo';

type PersistedState = {
  profile: UserProfile | null;
  activeProgramId: string | null;
  customPrograms: Program[];
  workoutLogs: WorkoutLog[];
  customExercises: ExerciseLibraryItem[];
  foodEntries: FoodEntry[];
};

type ProfileContextValue = {
  profile: UserProfile | null;
  activeProgramId: string | null;
  activeProgram: Program | null;
  programs: Program[];
  workoutLogs: WorkoutLog[];
  foodEntries: FoodEntry[];
  latestMetrics: BodyMetricEntry | null;
  hydrated: boolean;
  storageError: string | null;
  retryStorage: () => void;
  createProfileFromOnboarding: (onboarding: OnboardingProfile) => void;
  setActiveProgram: (programId: string) => void;
  addCustomProgram: (program: Program) => void;
  updateCustomProgram: (program: Program) => void;
  deleteCustomProgram: (programId: string) => void;
  addCustomExercise: (exercise: ExerciseLibraryItem) => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  removeFoodEntry: (entryId: string) => void;
  deleteAllProgress: () => void;
  updateWorkoutLogFeel: (logId: string, rpe: number) => void;
  updateBodyMetrics: (heightCm: number, weightKg: number) => void;
  updateExperience: (experience: Experience) => void;
  updateProfileFields: (patch: Partial<Pick<UserProfile, 'goal' | 'daysPerWeek' | 'equipment' | 'sex' | 'age' | 'units'>>) => void;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function buildMetricEntry(heightCm: number, weightKg: number, age: number, sex: Sex, goal: UserProfile['goal']): BodyMetricEntry {
  const bmi = calcBMI(heightCm, weightKg);
  const bmr = calcBMR({ heightCm, weightKg, age, sex });
  return {
    id: `metric_${Date.now()}`,
    timestamp: new Date().toISOString(),
    heightCm,
    weightKg,
    bmi,
    bmr,
    calorieTarget: calcCalorieTarget(bmr, goal),
  };
}

export function ProfileProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
  const [customPrograms, setCustomPrograms] = useState<Program[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [customExercises, setCustomExercises] = useState<ExerciseLibraryItem[]>([]);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const retryStorage = useCallback(() => setLoadAttempt(n => n + 1), []);

  useEffect(() => {
    setHydrated(false);
    let cancelled = false;
    replaceCustomExercises([]);
    loadUserData<PersistedState>(userId).then((saved) => {
      if (cancelled) return;
      setProfile(saved?.profile ?? null);
      setActiveProgramId(saved?.activeProgramId ?? null);
      setCustomPrograms(saved?.customPrograms ?? []);
      setWorkoutLogs(saved?.workoutLogs ?? []);
      setCustomExercises(saved?.customExercises ?? []);
      setFoodEntries(saved?.foodEntries ?? []);
      replaceCustomExercises(saved?.customExercises ?? []);
      setStorageError(null);
      setHydrated(true);
    }).catch(() => { if (!cancelled) setStorageError('Could not load your profile. Your saved data has not been changed.'); });
    return () => { cancelled = true; replaceCustomExercises([]); };
  }, [userId, loadAttempt]);

  useEffect(() => {
    if (!hydrated) return;
    saveUserData(userId, {
      profile,
      activeProgramId,
      customPrograms,
      workoutLogs,
      customExercises,
      foodEntries,
    } satisfies PersistedState).catch(() => setStorageError('Your latest changes could not be saved. Keep the app open and try saving again.'));
  }, [userId, hydrated, profile, activeProgramId, customPrograms, workoutLogs, customExercises, foodEntries]);

  const createProfileFromOnboarding = useCallback((onboarding: OnboardingProfile) => {
    const now = new Date().toISOString();
    const metricEntry = buildMetricEntry(
      onboarding.heightCm,
      onboarding.weightKg,
      onboarding.age,
      onboarding.sex,
      onboarding.goal ?? 'general_health'
    );
    const newProfile: UserProfile = {
      id: `profile_${Date.now()}`,
      units: onboarding.units,
      age: onboarding.age,
      sex: onboarding.sex,
      experience: onboarding.experience ?? 'beginner',
      goal: onboarding.goal ?? 'general_health',
      daysPerWeek: onboarding.daysPerWeek,
      equipment: onboarding.equipment,
      metricsHistory: [metricEntry],
      experienceHistory: [{ timestamp: now, experience: onboarding.experience ?? 'beginner' }],
      createdAt: now,
    };
    setProfile(newProfile);
  }, []);

  const setActiveProgram = useCallback((programId: string) => {
    setActiveProgramId(programId);
  }, []);

  const addCustomProgram = useCallback((program: Program) => {
    setCustomPrograms((prev) => [...prev, program]);
  }, []);

  const updateCustomProgram = useCallback((program: Program) => {
    setCustomPrograms((prev) => prev.map((p) => (p.id === program.id ? program : p)));
  }, []);

  const deleteCustomProgram = useCallback((programId: string) => {
    setCustomPrograms((prev) => prev.filter((p) => p.id !== programId));
    setActiveProgramId((prev) => (prev === programId ? null : prev));
  }, []);

  const addCustomExercise = useCallback((exercise: ExerciseLibraryItem) => {
    registerCustomExercise(exercise);
    setCustomExercises((prev) => [...prev.filter((e) => e.id !== exercise.id), exercise]);
  }, []);

  const addWorkoutLog = useCallback((log: WorkoutLog) => {
    setWorkoutLogs((prev) => [...prev, log]);
  }, []);

  const addFoodEntry = useCallback((entry: FoodEntry) => {
    setFoodEntries((prev) => [...prev, entry]);
  }, []);

  const removeFoodEntry = useCallback((entryId: string) => {
    setFoodEntries((prev) => prev.filter((entry) => entry.id !== entryId));
  }, []);

  const deleteAllProgress = useCallback(() => {
    setActiveProgramId(null);
    setCustomPrograms([]);
    setWorkoutLogs([]);
    setCustomExercises([]);
    setFoodEntries([]);
    replaceCustomExercises([]);
    setProfile((prev) => {
      if (!prev) return prev;
      const latestMetric = prev.metricsHistory[prev.metricsHistory.length - 1];
      return {
        ...prev,
        metricsHistory: latestMetric ? [latestMetric] : [],
        experienceHistory: [{ timestamp: new Date().toISOString(), experience: prev.experience }],
      };
    });
  }, []);

  const updateWorkoutLogFeel = useCallback((logId: string, rpe: number) => {
    setWorkoutLogs((prev) =>
      prev.map((log) => (log.id === logId ? { ...log, sets: log.sets.map((s) => ({ ...s, rpe })) } : log))
    );
  }, []);

  const updateBodyMetrics = useCallback((heightCm: number, weightKg: number) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const entry = buildMetricEntry(heightCm, weightKg, prev.age, prev.sex, prev.goal);
      return { ...prev, metricsHistory: [...prev.metricsHistory, entry] };
    });
  }, []);

  const updateExperience = useCallback((experience: Experience) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        experience,
        experienceHistory: [...prev.experienceHistory, { timestamp: new Date().toISOString(), experience }],
      };
    });
  }, []);

  const updateProfileFields = useCallback(
    (patch: Partial<Pick<UserProfile, 'goal' | 'daysPerWeek' | 'equipment' | 'sex' | 'age' | 'units'>>) => {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        if (('sex' in patch || 'age' in patch) && prev.metricsHistory.length > 0) {
          const last = prev.metricsHistory[prev.metricsHistory.length - 1];
          const entry = buildMetricEntry(last.heightCm, last.weightKg, next.age, next.sex, next.goal);
          next.metricsHistory = [...prev.metricsHistory, entry];
        }
        return next;
      });
    },
    []
  );

  const latestMetrics = profile ? profile.metricsHistory[profile.metricsHistory.length - 1] ?? null : null;
  const allPrograms = useMemo(() => [...programLibrary, ...customPrograms], [customPrograms]);
  const activeProgram = useMemo(
    () => allPrograms.find((p) => p.id === activeProgramId) ?? null,
    [allPrograms, activeProgramId]
  );

  const value: ProfileContextValue = {
    profile,
    activeProgramId,
    activeProgram,
    programs: allPrograms,
    workoutLogs,
    foodEntries,
    latestMetrics,
    hydrated,
    storageError,
    retryStorage,
    createProfileFromOnboarding,
    setActiveProgram,
    addCustomProgram,
    updateCustomProgram,
    deleteCustomProgram,
    addCustomExercise,
    addWorkoutLog,
    addFoodEntry,
    removeFoodEntry,
    deleteAllProgress,
    updateWorkoutLogFeel,
    updateBodyMetrics,
    updateExperience,
    updateProfileFields,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
