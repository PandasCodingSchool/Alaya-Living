export const UserRole = {
  USER: 'USER',
  PG_OWNER: 'PG_OWNER',
  ADMIN: 'ADMIN',
} as const;

export const UserIntent = {
  HAVE_ROOM: 'HAVE_ROOM',
  NEED_ROOM: 'NEED_ROOM',
  FIND_FLATMATES: 'FIND_FLATMATES',
  LIST_PG: 'LIST_PG',
  OTHER: 'OTHER',
} as const;

export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  NON_BINARY: 'NON_BINARY',
  PREFER_NOT_TO_SAY: 'PREFER_NOT_TO_SAY',
} as const;

export const WorkMode = {
  OFFICE: 'OFFICE',
  HYBRID: 'HYBRID',
  REMOTE: 'REMOTE',
  STUDENT: 'STUDENT',
} as const;

export const FoodPreference = {
  VEGETARIAN: 'VEGETARIAN',
  NON_VEGETARIAN: 'NON_VEGETARIAN',
  BOTH: 'BOTH',
  OTHER: 'OTHER',
} as const;

export const SmokingPreference = {
  NO: 'NO',
  YES: 'YES',
  OUTSIDE_ONLY: 'OUTSIDE_ONLY',
} as const;

export const AlcoholPreference = {
  NO: 'NO',
  SOCIALLY: 'SOCIALLY',
  YES: 'YES',
} as const;

export const SharingPermission = {
  YES: 'YES',
  NO: 'NO',
  REQUIRES_APPROVAL: 'REQUIRES_APPROVAL',
  UNKNOWN: 'UNKNOWN',
} as const;

export const PropertyType = {
  PG: 'PG',
  APARTMENT: 'APARTMENT',
  INDEPENDENT: 'INDEPENDENT',
  STUDIO: 'STUDIO',
} as const;

export const RoomType = {
  SINGLE: 'SINGLE',
  DOUBLE: 'DOUBLE',
  SHARED: 'SHARED',
} as const;

export const MatchStatus = {
  DISCOVERED: 'DISCOVERED',
  INTEREST_SENT: 'INTEREST_SENT',
  MATCHED: 'MATCHED',
  CHAT_STARTED: 'CHAT_STARTED',
} as const;

export const InterestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;
