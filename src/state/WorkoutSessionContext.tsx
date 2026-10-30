import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type SessionSet = {
  setNumber: number;
  weightKg: number;
  reps: number;
  done: boolean;
};

type SessionState = {
  workoutDayId: string | null;
  startedAt: number | null;
  exerciseOverrides: Record<string, string>;
  loggedSets: Record<string, SessionSet[]>;
  currentExerciseIndex: number;
};

const EMPTY_STATE: SessionState = {
  workoutDayId: null,
  startedAt: null,
  exerciseOverrides: {},
  loggedSets: {},
  currentExerciseIndex: 0,
};

type WorkoutSessionContextValue = {
  session: SessionState;
  startSession: (workoutDayId: string) => void;
  swapExercise: (programExerciseId: string, newExerciseId: string) => void;
  initSets: (programExerciseId: string, sets: SessionSet[]) => void;
  toggleSet: (programExerciseId: string, setNumber: number) => void;
  updateSetField: (programExerciseId: string, setNumber: number, patch: Partial<Pick<SessionSet, 'weightKg' | 'reps'>>) => void;
  addSet: (programExerciseId: string, weightKg: number, reps: number) => void;
  removeLastSet: (programExerciseId: string) => void;
  setCurrentExerciseIndex: (index: number) => void;
  resetSession: () => void;
};

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | undefined>(undefined);

export function WorkoutSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(EMPTY_STATE);

  const startSession = useCallback((workoutDayId: string) => {
    setSession((prev) => ({ ...EMPTY_STATE, workoutDayId, startedAt: Date.now(), exerciseOverrides: prev.exerciseOverrides }));
  }, []);

  const swapExercise = useCallback((programExerciseId: string, newExerciseId: string) => {
    setSession((prev) => ({
      ...prev,
      exerciseOverrides: { ...prev.exerciseOverrides, [programExerciseId]: newExerciseId },
    }));
  }, []);

  const initSets = useCallback((programExerciseId: string, sets: SessionSet[]) => {
    setSession((prev) => {
      if (prev.loggedSets[programExerciseId]) return prev;
      return { ...prev, loggedSets: { ...prev.loggedSets, [programExerciseId]: sets } };
    });
  }, []);

  const toggleSet = useCallback((programExerciseId: string, setNumber: number) => {
    setSession((prev) => {
      const sets = prev.loggedSets[programExerciseId] ?? [];
      const updated = sets.map((s) => (s.setNumber === setNumber ? { ...s, done: !s.done } : s));
      return { ...prev, loggedSets: { ...prev.loggedSets, [programExerciseId]: updated } };
    });
  }, []);

  const updateSetField = useCallback(
    (programExerciseId: string, setNumber: number, patch: Partial<Pick<SessionSet, 'weightKg' | 'reps'>>) => {
      setSession((prev) => {
        const sets = prev.loggedSets[programExerciseId] ?? [];
        const updated = sets.map((s) => (s.setNumber === setNumber ? { ...s, ...patch } : s));
        return { ...prev, loggedSets: { ...prev.loggedSets, [programExerciseId]: updated } };
      });
    },
    []
  );

  const addSet = useCallback((programExerciseId: string, weightKg: number, reps: number) => {
    setSession((prev) => {
      const sets = prev.loggedSets[programExerciseId] ?? [];
      const nextSet: SessionSet = { setNumber: sets.length + 1, weightKg, reps, done: false };
      return { ...prev, loggedSets: { ...prev.loggedSets, [programExerciseId]: [...sets, nextSet] } };
    });
  }, []);

  const removeLastSet = useCallback((programExerciseId: string) => {
    setSession((prev) => {
      const sets = prev.loggedSets[programExerciseId] ?? [];
      if (sets.length === 0) return prev;
      return { ...prev, loggedSets: { ...prev.loggedSets, [programExerciseId]: sets.slice(0, -1) } };
    });
  }, []);

  const setCurrentExerciseIndex = useCallback((index: number) => {
    setSession((prev) => ({ ...prev, currentExerciseIndex: index }));
  }, []);

  const resetSession = useCallback(() => {
    setSession(EMPTY_STATE);
  }, []);

  const value = useMemo(
    () => ({
      session,
      startSession,
      swapExercise,
      initSets,
      toggleSet,
      updateSetField,
      addSet,
      removeLastSet,
      setCurrentExerciseIndex,
      resetSession,
    }),
    [
      session,
      startSession,
      swapExercise,
      initSets,
      toggleSet,
      updateSetField,
      addSet,
      removeLastSet,
      setCurrentExerciseIndex,
      resetSession,
    ]
  );

  return <WorkoutSessionContext.Provider value={value}>{children}</WorkoutSessionContext.Provider>;
}

export function useWorkoutSession() {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx) throw new Error('useWorkoutSession must be used within WorkoutSessionProvider');
  return ctx;
}
