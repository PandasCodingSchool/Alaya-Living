export const LOCALITIES = [
  'Bellandur',
  'Kadubeesanahalli',
  'Marathahalli',
  'Whitefield',
  'HSR',
  'Koramangala',
  'Electronic City',
] as const;

export const CITY = 'Bengaluru';

export const LANGUAGES = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Bengali',
] as const;

export const MATCH_WEIGHTS = {
  location: 0.25,
  budget: 0.2,
  moveIn: 0.15,
  lifestyle: 0.15,
  food: 0.1,
  language: 0.1,
  work: 0.05,
} as const;

export const DEV_OTP = '123456';

export const AMENITIES = [
  'WiFi',
  'AC',
  'Attached bathroom',
  'Food',
  'Laundry',
  'Parking',
  'Power backup',
  'Furnished',
  'Geyser',
  'Housekeeping',
] as const;
