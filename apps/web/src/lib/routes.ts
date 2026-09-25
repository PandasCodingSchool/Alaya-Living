import type { Profile } from './types';

export function isPgOperator(user: Pick<Profile, 'role'> | null | undefined) {
  return user?.role === 'PG_OWNER';
}

export function homeForUser(user: Pick<Profile, 'role' | 'onboardingDone'> | null | undefined) {
  if (!user?.onboardingDone) return '/onboarding';
  if (user?.role === 'ADMIN') return '/admin';
  if (isPgOperator(user)) return '/operator';
  return '/discover';
}

export const SEEKER_ONLY_PREFIXES = ['/discover', '/matches', '/listings', '/people', '/saved'];
