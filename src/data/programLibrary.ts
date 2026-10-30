import type { Program, ProgramExercise, WorkoutDay } from '../models/types';

let exerciseSeq = 0;
function pe(exerciseId: string, sets: number, reps: string, restSec: number): ProgramExercise {
  exerciseSeq += 1;
  return { id: `pe_${exerciseSeq}`, exerciseId, sets, reps, restSec };
}

let daySeq = 0;
function day(name: string, exercises: ProgramExercise[]): WorkoutDay {
  daySeq += 1;
  return { id: `day_${daySeq}`, name, exercises };
}

export const programLibrary: Program[] = [
  {
    id: 'beginner_full_body',
    name: 'Beginner Full-Body',
    source: 'built_in',
    experience: ['beginner'],
    goals: ['build_muscle', 'general_health', 'lose_weight'],
    daysPerWeek: 3,
    equipment: ['dumbbells', 'bodyweight'],
    description: 'Three full-body sessions a week — the most efficient way to build a base when training is new to you.',
    days: [
      day('Full Body A', [
        pe('goblet_squat', 3, '10', 90),
        pe('incline_dumbbell_press', 3, '10', 90),
        pe('dumbbell_row', 3, '10', 90),
        pe('lateral_raise', 2, '12', 60),
        pe('plank', 3, '45s', 45),
      ]),
      day('Full Body B', [
        pe('bodyweight_squat', 3, '15', 75),
        pe('push_up', 3, '12', 75),
        pe('dumbbell_curl', 3, '12', 60),
        pe('standing_calf_raise', 3, '15', 45),
        pe('plank', 3, '45s', 45),
      ]),
    ],
  },
  {
    id: 'intermediate_ppl',
    name: 'Intermediate Push/Pull/Legs',
    source: 'built_in',
    experience: ['intermediate'],
    goals: ['build_muscle'],
    daysPerWeek: 6,
    equipment: ['full_gym'],
    description: 'A 6-day push/pull/legs split for lifters with a consistent training history who want more volume.',
    days: [
      day('Push Day', [
        pe('bench_press', 4, '8', 120),
        pe('overhead_press', 3, '10', 90),
        pe('incline_dumbbell_press', 3, '10', 90),
        pe('lateral_raise', 3, '15', 60),
        pe('tricep_pushdown', 3, '12', 60),
      ]),
      day('Pull Day', [
        pe('barbell_row', 4, '8', 120),
        pe('lat_pulldown', 3, '10', 90),
        pe('seated_cable_row', 3, '10', 90),
        pe('face_pull', 3, '15', 60),
        pe('barbell_curl', 3, '12', 60),
      ]),
      day('Leg Day', [
        pe('back_squat', 4, '8', 150),
        pe('romanian_deadlift', 3, '10', 120),
        pe('leg_press', 3, '12', 90),
        pe('standing_calf_raise', 4, '15', 60),
        pe('hanging_leg_raise', 3, '12', 60),
      ]),
    ],
  },
  {
    id: 'advanced_5day_split',
    name: 'Advanced 5-Day Body Part Split',
    source: 'built_in',
    experience: ['advanced'],
    goals: ['build_muscle'],
    daysPerWeek: 5,
    equipment: ['full_gym'],
    description: 'High-volume body-part specialization for lifters with 2+ years of progressive overload experience.',
    days: [
      day('Chest', [
        pe('bench_press', 5, '6', 150),
        pe('incline_dumbbell_press', 4, '10', 90),
        pe('cable_fly', 3, '15', 60),
        pe('dips', 3, '10', 90),
      ]),
      day('Back', [
        pe('barbell_row', 5, '6', 150),
        pe('pull_up', 4, '8', 120),
        pe('lat_pulldown', 3, '12', 90),
        pe('seated_cable_row', 3, '12', 90),
      ]),
      day('Shoulders', [
        pe('overhead_press', 5, '6', 150),
        pe('lateral_raise', 4, '15', 60),
        pe('face_pull', 3, '15', 60),
      ]),
      day('Arms', [
        pe('barbell_curl', 4, '10', 75),
        pe('dumbbell_curl', 3, '12', 60),
        pe('tricep_pushdown', 4, '10', 75),
        pe('skullcrusher', 3, '12', 60),
      ]),
      day('Legs', [
        pe('back_squat', 5, '6', 150),
        pe('romanian_deadlift', 4, '10', 120),
        pe('leg_press', 4, '12', 90),
        pe('standing_calf_raise', 4, '15', 60),
        pe('hanging_leg_raise', 3, '12', 60),
      ]),
    ],
  },
  {
    id: 'bodyweight_foundations',
    name: 'Bodyweight Foundations',
    source: 'built_in',
    experience: ['beginner', 'intermediate'],
    goals: ['build_muscle', 'lose_weight', 'general_health'],
    daysPerWeek: 3,
    equipment: ['bodyweight'],
    description: 'No equipment needed — build real strength anywhere with just your bodyweight.',
    days: [
      day('Full Body A', [
        pe('bodyweight_squat', 3, '15', 60),
        pe('push_up', 3, '12', 60),
        pe('plank', 3, '45s', 45),
        pe('jumping_jacks', 3, '30s', 30),
      ]),
      day('Full Body B', [
        pe('lunges', 3, '12', 60),
        pe('dips', 3, '10', 60),
        pe('hanging_leg_raise', 3, '10', 60),
        pe('jumping_jacks', 3, '30s', 30),
      ]),
    ],
  },
  {
    id: 'general_health',
    name: 'General Health & Movement',
    source: 'built_in',
    experience: ['beginner', 'intermediate', 'advanced'],
    goals: ['general_health', 'endurance'],
    daysPerWeek: 3,
    equipment: ['bodyweight', 'dumbbells'],
    description: 'Low-impact, well-rounded sessions built for consistency rather than maximal strength.',
    days: [
      day('Full Body', [
        pe('bodyweight_squat', 2, '15', 60),
        pe('push_up', 2, '12', 60),
        pe('dumbbell_row', 2, '12', 60),
        pe('plank', 2, '40s', 40),
        pe('jumping_jacks', 3, '30s', 30),
      ]),
    ],
  },
];

export function getProgram(id: string) {
  const program = programLibrary.find((p) => p.id === id);
  if (!program) throw new Error(`Unknown program id: ${id}`);
  return program;
}
