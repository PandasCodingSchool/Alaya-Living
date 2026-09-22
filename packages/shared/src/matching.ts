import { MATCH_WEIGHTS } from './constants';
import type { CompatibilityReason, CompatibilityResult } from './types';

export interface MatchablePerson {
  localities: string[];
  minBudget: number | null;
  maxBudget: number | null;
  moveInDate: Date | null;
  sleepStart: number | null;
  sleepEnd: number | null;
  cleanliness: number | null;
  noiseTolerance: number | null;
  cookingFrequency: number | null;
  guestFrequency: number | null;
  foodPreference: string | null;
  smokingPreference: string | null;
  smokingRequired: boolean;
  languages: string[];
  languageMatters: boolean;
  workMode: string | null;
  gender: string | null;
  preferredGenders: string[];
}

export interface MatchableRoom {
  locality: string;
  roommateContribution: number;
  availableFrom: Date;
  availableSlots: number;
  sharingPermission: string;
  owner: MatchablePerson;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function scaleDistance(a: number | null, b: number | null, span: number) {
  if (a == null || b == null) return 0.5;
  return clamp(1 - Math.abs(a - b) / span);
}

function budgetOverlap(
  aMin: number | null,
  aMax: number | null,
  bMin: number | null,
  bMax: number | null,
) {
  if (aMin == null || aMax == null || bMin == null || bMax == null) return 0.5;
  const overlap = Math.min(aMax, bMax) - Math.max(aMin, bMin);
  if (overlap < 0) return 0;
  const span = Math.max(aMax, bMax) - Math.min(aMin, bMin) || 1;
  return clamp(overlap / span + 0.25);
}

function daysBetween(a: Date | null, b: Date | null) {
  if (!a || !b) return null;
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

export function passesHardFilters(viewer: MatchablePerson, candidate: MatchablePerson) {
  const sharedLocality = viewer.localities.some((l) => candidate.localities.includes(l));
  if (viewer.localities.length && candidate.localities.length && !sharedLocality) {
    return false;
  }

  if (
    viewer.minBudget != null &&
    viewer.maxBudget != null &&
    candidate.minBudget != null &&
    candidate.maxBudget != null
  ) {
    const overlap = Math.min(viewer.maxBudget, candidate.maxBudget) - Math.max(viewer.minBudget, candidate.minBudget);
    if (overlap < 0) return false;
  }

  const gap = daysBetween(viewer.moveInDate, candidate.moveInDate);
  if (gap != null && gap > 45) return false;

  if (viewer.smokingRequired && viewer.smokingPreference && candidate.smokingPreference) {
    if (viewer.smokingPreference === 'NO' && candidate.smokingPreference === 'YES') return false;
    if (viewer.smokingPreference === 'YES' && candidate.smokingPreference === 'NO') return false;
  }

  if (viewer.preferredGenders.length && candidate.gender) {
    if (!viewer.preferredGenders.includes(candidate.gender)) return false;
  }

  return true;
}

export function passesRoomHardFilters(viewer: MatchablePerson, room: MatchableRoom) {
  if (room.sharingPermission === 'NO') return false;
  if (room.availableSlots < 1) return false;
  if (viewer.localities.length && !viewer.localities.includes(room.locality)) return false;
  if (viewer.maxBudget != null && room.roommateContribution > viewer.maxBudget) return false;
  if (viewer.minBudget != null && room.roommateContribution < viewer.minBudget * 0.6) return false;
  const gap = daysBetween(viewer.moveInDate, room.availableFrom);
  if (gap != null && gap > 45) return false;
  return passesHardFilters(viewer, room.owner);
}

export function scorePeople(a: MatchablePerson, b: MatchablePerson): CompatibilityResult {
  const sharedLocalities = a.localities.filter((l) => b.localities.includes(l));
  const locationScore = sharedLocalities.length
    ? 1
    : a.localities.length && b.localities.length
      ? 0.15
      : 0.5;

  const budgetScore = budgetOverlap(a.minBudget, a.maxBudget, b.minBudget, b.maxBudget);

  const moveGap = daysBetween(a.moveInDate, b.moveInDate);
  const moveInScore = moveGap == null ? 0.5 : clamp(1 - moveGap / 45);

  const lifestyleScore =
    (scaleDistance(a.sleepStart, b.sleepStart, 8) +
      scaleDistance(a.sleepEnd, b.sleepEnd, 8) +
      scaleDistance(a.cleanliness, b.cleanliness, 4) +
      scaleDistance(a.noiseTolerance, b.noiseTolerance, 4) +
      scaleDistance(a.cookingFrequency, b.cookingFrequency, 4) +
      scaleDistance(a.guestFrequency, b.guestFrequency, 4)) /
    6;

  const foodScore =
    !a.foodPreference || !b.foodPreference
      ? 0.5
      : a.foodPreference === b.foodPreference || a.foodPreference === 'BOTH' || b.foodPreference === 'BOTH'
        ? 1
        : 0.25;

  const sharedLanguages = a.languages.filter((l) => b.languages.includes(l));
  const languageScore = a.languageMatters || b.languageMatters
    ? sharedLanguages.length
      ? 1
      : 0.1
    : sharedLanguages.length
      ? 0.85
      : 0.55;

  const workScore = !a.workMode || !b.workMode ? 0.5 : a.workMode === b.workMode ? 1 : 0.45;

  const score = Math.round(
    (locationScore * MATCH_WEIGHTS.location +
      budgetScore * MATCH_WEIGHTS.budget +
      moveInScore * MATCH_WEIGHTS.moveIn +
      lifestyleScore * MATCH_WEIGHTS.lifestyle +
      foodScore * MATCH_WEIGHTS.food +
      languageScore * MATCH_WEIGHTS.language +
      workScore * MATCH_WEIGHTS.work) *
      100,
  );

  const reasons: CompatibilityReason[] = [];

  if (sharedLocalities.length) {
    reasons.push({
      factor: 'location',
      kind: 'POSITIVE',
      score: locationScore,
      description: `Same locality · ${sharedLocalities.join(', ')}`,
    });
  } else if (a.localities.length && b.localities.length) {
    reasons.push({
      factor: 'location',
      kind: 'DIFFERENCE',
      score: locationScore,
      description: 'Different preferred localities',
    });
  }

  if (budgetScore >= 0.6) {
    reasons.push({
      factor: 'budget',
      kind: 'POSITIVE',
      score: budgetScore,
      description: 'Similar budget',
    });
  } else if (a.minBudget != null && b.minBudget != null) {
    reasons.push({
      factor: 'budget',
      kind: 'DIFFERENCE',
      score: budgetScore,
      description: 'Different budget range',
    });
  }

  if (moveInScore >= 0.6) {
    reasons.push({
      factor: 'moveIn',
      kind: 'POSITIVE',
      score: moveInScore,
      description: 'Similar move-in date',
    });
  } else if (moveGap != null) {
    reasons.push({
      factor: 'moveIn',
      kind: 'DIFFERENCE',
      score: moveInScore,
      description: 'Move-in dates are farther apart',
    });
  }

  if (scaleDistance(a.sleepStart, b.sleepStart, 8) >= 0.7) {
    reasons.push({
      factor: 'sleep',
      kind: 'POSITIVE',
      score: scaleDistance(a.sleepStart, b.sleepStart, 8),
      description: 'Similar sleep schedule',
    });
  } else if (a.sleepStart != null && b.sleepStart != null) {
    reasons.push({
      factor: 'sleep',
      kind: 'DIFFERENCE',
      score: scaleDistance(a.sleepStart, b.sleepStart, 8),
      description: 'Different sleep schedules',
    });
  }

  if (scaleDistance(a.cleanliness, b.cleanliness, 4) >= 0.7) {
    reasons.push({
      factor: 'cleanliness',
      kind: 'POSITIVE',
      score: scaleDistance(a.cleanliness, b.cleanliness, 4),
      description: 'Similar cleanliness preference',
    });
  }

  if (a.smokingPreference && b.smokingPreference && a.smokingPreference === b.smokingPreference) {
    reasons.push({
      factor: 'smoking',
      kind: 'POSITIVE',
      score: 1,
      description: a.smokingPreference === 'NO' ? 'Both non-smokers' : 'Matching smoking preference',
    });
  }

  if (foodScore >= 0.8) {
    reasons.push({
      factor: 'food',
      kind: 'POSITIVE',
      score: foodScore,
      description: 'Compatible food preference',
    });
  } else if (a.foodPreference && b.foodPreference) {
    reasons.push({
      factor: 'food',
      kind: 'DIFFERENCE',
      score: foodScore,
      description: 'Different food preferences',
    });
  }

  if (sharedLanguages.length) {
    reasons.push({
      factor: 'language',
      kind: 'POSITIVE',
      score: languageScore,
      description: `Shared languages · ${sharedLanguages.join(', ')}`,
    });
  } else if ((a.languageMatters || b.languageMatters) && a.languages.length && b.languages.length) {
    reasons.push({
      factor: 'language',
      kind: 'DIFFERENCE',
      score: languageScore,
      description: 'No shared language',
    });
  }

  if (workScore === 1) {
    reasons.push({
      factor: 'work',
      kind: 'POSITIVE',
      score: workScore,
      description: 'Similar work schedule',
    });
  }

  return { score, reasons: reasons.slice(0, 6) };
}

export function scoreRoom(viewer: MatchablePerson, room: MatchableRoom): CompatibilityResult {
  const people = scorePeople(viewer, room.owner);
  const locationScore = viewer.localities.includes(room.locality) ? 1 : 0.2;
  const budgetScore =
    viewer.maxBudget == null
      ? 0.5
      : room.roommateContribution <= viewer.maxBudget
        ? clamp(1 - Math.abs((viewer.maxBudget + (viewer.minBudget ?? 0)) / 2 - room.roommateContribution) / 8000)
        : 0.1;

  const blended = Math.round(people.score * 0.7 + locationScore * 15 + budgetScore * 15);
  const reasons = [...people.reasons];

  if (viewer.localities.includes(room.locality)) {
    reasons.unshift({
      factor: 'room-location',
      kind: 'POSITIVE',
      score: 1,
      description: `Room in ${room.locality}`,
    });
  }

  if (viewer.maxBudget != null && room.roommateContribution <= viewer.maxBudget) {
    reasons.splice(1, 0, {
      factor: 'room-budget',
      kind: 'POSITIVE',
      score: budgetScore,
      description: `₹${room.roommateContribution.toLocaleString('en-IN')} fits your budget`,
    });
  }

  return { score: Math.min(99, blended), reasons: reasons.slice(0, 6) };
}
