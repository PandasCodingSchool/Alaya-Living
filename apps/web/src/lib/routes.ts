import type { Profile } from './types';

export function homeForUser(user: Pick<Profile, 'role' | 'onboardingDone'> | null | undefined) {
  if (!user?.onboardingDone) return '/onboarding';
  if (user.role === 'PG_OWNER' || user.role === 'ADMIN') return '/operator';
  return '/discover';
}
