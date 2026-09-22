import { Preference, Profile, User, UserLanguage } from '@prisma/client';

type FullUser = User & {
  profile: Profile | null;
  preferences: Preference | null;
  languages: UserLanguage[];
};

export function profileCompletion(user: FullUser) {
  const checks = [
    !!user.profile?.firstName,
    !!user.profile?.age,
    !!user.profile?.occupation,
    !!user.profile?.bio,
    !!user.profile?.intent,
    !!user.profile?.workMode,
    !!user.preferences?.minBudget,
    !!user.preferences?.maxBudget,
    !!user.preferences?.moveInDate,
    (user.preferences?.localities.length || 0) > 0,
    user.languages.length > 0,
    user.preferences?.sleepStart != null,
    !!user.preferences?.foodPreference,
    !!user.preferences?.smokingPreference,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function toPublicProfile(user: FullUser) {
  return {
    id: user.id,
    name: user.profile?.firstName || 'Member',
    age: user.profile?.age ?? null,
    gender: user.profile?.gender ?? null,
    occupation: user.profile?.occupation ?? user.profile?.jobTitle ?? null,
    bio: user.profile?.bio ?? null,
    photoUrl: user.profile?.photoUrl ?? null,
    city: user.profile?.city ?? 'Bengaluru',
    workLocation: user.profile?.workLocation ?? null,
    workMode: user.profile?.workMode ?? null,
    intent: user.profile?.intent ?? null,
    phoneVerified: user.phoneVerified,
    emailVerified: user.emailVerified,
    completion: profileCompletion(user),
    localities: user.preferences?.localities ?? [],
    languages: user.languages.map((l) => l.language),
    foodPreference: user.preferences?.foodPreference ?? null,
    smokingPreference: user.preferences?.smokingPreference ?? null,
    alcoholPreference: user.preferences?.alcoholPreference ?? null,
    pets: user.preferences?.pets ?? null,
    sleepStart: user.preferences?.sleepStart ?? null,
    sleepEnd: user.preferences?.sleepEnd ?? null,
    cleanliness: user.preferences?.cleanliness ?? null,
    noiseTolerance: user.preferences?.noiseTolerance ?? null,
    cookingFrequency: user.preferences?.cookingFrequency ?? null,
    guestFrequency: user.preferences?.guestFrequency ?? null,
    minBudget: user.preferences?.minBudget ?? null,
    maxBudget: user.preferences?.maxBudget ?? null,
    moveInDate: user.preferences?.moveInDate?.toISOString() ?? null,
    languageMatters: user.preferences?.languageMatters ?? false,
    smokingRequired: user.preferences?.smokingRequired ?? false,
    preferredGenders: user.preferences?.preferredGenders ?? [],
    onboardingDone: user.profile?.onboardingDone ?? false,
  };
}

export function toMe(user: FullUser) {
  return {
    ...toPublicProfile(user),
    email: user.email,
    phone: user.phone,
  };
}

export const userInclude = {
  profile: true,
  preferences: true,
  languages: true,
} as const;
