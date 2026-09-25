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
  role?: 'USER' | 'PG_OWNER' | 'ADMIN';
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

export interface Agreement {
  id: string;
  matchId: string;
  roomId: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  rentEach: number;
  electricity: string;
  internet: string;
  cleaning: string;
  groceries: string;
  guests: string;
  quietHours: string;
  notes: string | null;
  creatorConfirmed: boolean;
  otherConfirmed: boolean;
  confirmedAt: string | null;
  createdAt: string;
  mine: boolean;
  waitingOnMe: boolean;
  other: Profile;
}

export interface ReplacementPost {
  id: string;
  roomId: string;
  departingName: string;
  leaveDate: string;
  notes: string | null;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  createdAt: string;
  mine: boolean;
  room: Room;
  createdBy: Profile;
  candidates?: Profile[];
}

export interface FlatGroup {
  id: string;
  title: string;
  targetSize: number;
  targetRentEach: number;
  combinedBudget: number;
  localities: string[];
  moveInDate: string | null;
  notes: string | null;
  status: 'FORMING' | 'COMPLETE' | 'SEARCHING' | 'CLOSED';
  createdAt: string;
  isOwner: boolean;
  myStatus: 'INVITED' | 'JOINED' | 'LEFT' | null;
  members: { role: string; status: string; user: Profile }[];
  suggestedPeople?: Profile[];
  suggestedPgs?: PgListing[];
  suggestedFlats?: FlatListing[];
}

export interface FlatListing {
  id: string;
  title: string;
  locality: string;
  city: string;
  bhk: 'TWO_BHK' | 'THREE_BHK';
  monthlyRent: number;
  deposit: number | null;
  furnished: boolean;
  photos: string[];
  amenities: string[];
  notes?: string | null;
  availableFrom: string;
  status?: string;
  listedBy: Profile | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE';
  body: string;
  imageUrl: string | null;
  createdAt: string;
}

export interface PgOperatorDashboard {
  summary: {
    listings: number;
    activeListings: number;
    totalBeds: number;
    openBeds: number;
    inquiries: number;
  };
  listings: PgListing[];
  inquiries: {
    id: string;
    createdAt: string;
    user: Profile;
    pgListing: { id: string; title: string; locality: string } | null;
    matched: boolean;
    conversationId: string | null;
  }[];
}

export interface PgSharingOption {
  sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE';
  monthlyRent: number;
  bedsAvailable: number;
  totalBeds: number;
}

export interface PgBed {
  id: string;
  roomLabel: string;
  bedLabel: string;
  sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE';
  monthlyRent: number;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export interface PgListing {
  id: string;
  title: string;
  locality: string;
  city: string;
  propertyType: string;
  monthlyRent: number;
  deposit: number | null;
  genderPolicy: string;
  mealsIncluded: boolean;
  sharingPermission: string;
  bedsAvailable: number;
  totalBeds: number;
  sharingOptions?: PgSharingOption[];
  beds?: PgBed[];
  photos: string[];
  amenities: string[];
  notes?: string | null;
  availableFrom: string;
  status?: string;
  owner: Profile;
}

export interface ContactAccess {
  allowed: boolean;
  reason: 'NOT_MATCHED' | 'PREMIUM_REQUIRED' | null;
  phone: string | null;
  email: string | null;
  membership: Membership;
}
