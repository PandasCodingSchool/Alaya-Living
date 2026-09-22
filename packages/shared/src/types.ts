export type Locality = (typeof import('./constants').LOCALITIES)[number];

export interface CompatibilityReason {
  factor: string;
  kind: 'POSITIVE' | 'DIFFERENCE';
  score: number;
  description: string;
}

export interface CompatibilityResult {
  score: number;
  reasons: CompatibilityReason[];
}

export interface PublicProfile {
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
}

export interface PublicRoom {
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
  owner: PublicProfile;
}
