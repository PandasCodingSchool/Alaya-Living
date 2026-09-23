export interface CompatibilityReason {
  factor: string;
  kind: 'POSITIVE' | 'DIFFERENCE';
  score: number;
  description: string;
}

export interface Compatibility {
  score: number;
  reasons: CompatibilityReason[];
}

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  occupation: string | null;
  bio: string | null;
  photoUrl: string | null;
  city: string | null;
  workLocation: string | null;
  workMode: string | null;
  intent: string | null;
  phoneVerified: boolean;
  emailVerified?: boolean;
  completion: number;
  localities: string[];
  languages: string[];
  foodPreference: string | null;
  smokingPreference: string | null;
  alcoholPreference: string | null;
  pets: boolean | null;
  sleepStart: number | null;
  sleepEnd: number | null;
  cleanliness: number | null;
  noiseTolerance: number | null;
  cookingFrequency: number | null;
  guestFrequency: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  moveInDate: string | null;
  languageMatters?: boolean;
  smokingRequired?: boolean;
  preferredGenders?: string[];
  preferredRadiusKm?: number;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  onboardingDone?: boolean;
  email?: string | null;
  phone?: string | null;
  compatibility?: Compatibility;
}

export interface Room {
  id: string;
  locality: string;
  city: string;
  propertyType: string;
  roomType: string;
  monthlyRent: number;
  roommateContribution: number;
  deposit: number | null;
  availableFrom: string;
  amenities: string[];
  sharingPermission: string;
  photos: string[];
  currentOccupants: number;
  availableSlots: number;
  capacity: number;
  furnished: boolean;
  notes?: string | null;
  owner: Profile;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  distanceLabel?: string | null;
  compatibility?: Compatibility;
}

export interface InterestState {
  interested: boolean;
  theyInterested: boolean;
  matched: boolean;
  matchId: string | null;
  conversationId: string | null;
  status: string;
}

export interface Membership {
  isPremium: boolean;
  matchCount: number;
  freeLimit: number;
  freeRemaining: number;
}

export interface ContactAccess {
  allowed: boolean;
  reason: 'NOT_MATCHED' | 'PREMIUM_REQUIRED' | null;
  phone: string | null;
  email: string | null;
  membership: Membership;
}
