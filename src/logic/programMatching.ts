// Program recommendation — see uploads/fitness-app-prompt.md §4
import type { Equipment, Program, ProgramMatch } from '../models/types';
import type { Experience, Goal } from '../screens/Onboarding/types';

const EXPERIENCE_ORDER: Experience[] = ['beginner', 'intermediate', 'advanced'];

const GOAL_LABELS: Record<Goal, string> = {
  build_muscle: 'building muscle',
  lose_weight: 'losing weight',
  endurance: 'endurance',
  general_health: 'general health',
};

const GOAL_TITLES: Record<Goal, string> = {
  build_muscle: 'Build muscle',
  lose_weight: 'Lose weight',
  endurance: 'Endurance',
  general_health: 'General health',
};

export function goalTitle(goal: Goal) {
  return GOAL_TITLES[goal];
}

// Two signals, averaged:
// - feasibility: can the program actually be run on what the user has (full_gym covers everything)
// - affinity: does the program's equipment tag actually match what the user selected, so a
//   full-gym user's top pick is a program built around a full gym, not just one that merely
//   *works* with a full gym (a bodyweight program is feasible for a full-gym owner too, but
//   shouldn't out-rank a program actually designed around their setup).
function equipmentScore(programEquipment: Equipment[], userEquipment: string[]) {
  const feasible =
    programEquipment.length === 0 ||
    userEquipment.includes('full_gym') ||
    programEquipment.every((e) => userEquipment.includes(e));
  const feasibility = feasible ? 1 : programEquipment.filter((e) => userEquipment.includes(e)).length / programEquipment.length;

  const union = new Set([...programEquipment, ...userEquipment]);
  const intersection = programEquipment.filter((e) => userEquipment.includes(e));
  const affinity = union.size === 0 ? 1 : intersection.length / union.size;

  return { feasibility, affinity, combined: (feasibility + affinity) / 2 };
}

type MatchProfile = {
  experience: Experience;
  goal: Goal;
  daysPerWeek: number;
  equipment: string[];
};

export function matchPrograms(profile: MatchProfile, library: Program[]): ProgramMatch[] {
  const matches = library.map((program) => {
    const reasons: string[] = [];
    let score = 0;

    if (program.experience.includes(profile.experience)) {
      score += 40;
      reasons.push(`Matches your ${profile.experience} level`);
    } else {
      const userIdx = EXPERIENCE_ORDER.indexOf(profile.experience);
      const programMinIdx = Math.min(...program.experience.map((e) => EXPERIENCE_ORDER.indexOf(e)));
      if (programMinIdx > userIdx) {
        const tag = program.experience[0];
        reasons.push(`Tagged ${tag} — revisit after your next level check-in`);
        score += 8;
      } else {
        score += 18;
      }
    }

    if (program.goals.includes(profile.goal)) {
      score += 30;
      reasons.push(`Built for ${GOAL_LABELS[profile.goal]}`);
    }

    const dayDiff = Math.abs(program.daysPerWeek - profile.daysPerWeek);
    if (dayDiff === 0) {
      score += 10;
      reasons.push(`Fits your ${profile.daysPerWeek}-day schedule`);
    } else if (dayDiff === 1) {
      score += 6;
      reasons.push(`Close to your ${profile.daysPerWeek}-day schedule (${program.daysPerWeek} days/week)`);
    } else if (dayDiff <= 2) {
      score += 3;
    }

    const equipment = equipmentScore(program.equipment, profile.equipment);
    score += Math.round(equipment.combined * 20);
    if (equipment.feasibility < 0.999) {
      reasons.push("Needs equipment you haven't selected");
    } else if (equipment.affinity >= 0.999) {
      reasons.push('Works with the equipment you have');
    }

    return { program, score: Math.round(score), reasons };
  });

  return matches.sort((a, b) => b.score - a.score);
}
