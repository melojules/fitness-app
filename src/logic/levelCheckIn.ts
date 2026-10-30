import type { UserProfile } from '../models/types';

const CHECK_IN_DAYS = 56; // 8 weeks — see uploads/fitness-app-prompt.md §7

export function isLevelCheckInDue(profile: UserProfile) {
  const last = profile.experienceHistory[profile.experienceHistory.length - 1];
  if (!last) return false;
  const daysSince = (Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= CHECK_IN_DAYS;
}

export function daysSinceLastCheckIn(profile: UserProfile) {
  const last = profile.experienceHistory[profile.experienceHistory.length - 1];
  if (!last) return 0;
  return Math.floor((Date.now() - new Date(last.timestamp).getTime()) / (1000 * 60 * 60 * 24));
}
