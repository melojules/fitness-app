import type { Program, WorkoutDay, WorkoutLog } from '../models/types';

// Which of the program's workout days is "up next", cycling through in order
// based on how many sessions have already been logged against this program.
export function getTodaysDay(program: Program, programLogs: WorkoutLog[]): WorkoutDay {
  const index = programLogs.length % program.days.length;
  return program.days[index];
}
