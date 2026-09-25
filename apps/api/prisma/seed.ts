import {
  AlcoholPreference,
  FlatGroupStatus,
  FoodPreference,
  Gender,
  GroupMemberRole,
  GroupMemberStatus,
  PgBedStatus,
  PgGenderPolicy,
  PgSharingType,
  PrismaClient,
  PropertyType,
  ReplacementStatus,
  RoomType,
  SharingPermission,
  SmokingPreference,
  UserIntent,
  UserRole,
  WorkMode,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  phone: string;
  firstName: string;
  age: number;
  gender: Gender;
  occupation: string;
  jobTitle: string;
  bio: string;
  workLocation: string;
  workMode: WorkMode;
  intent: UserIntent;
  phoneVerified?: boolean;
  minBudget: number;
  maxBudget: number;
  moveInDate: string;
  sleepStart: number;
  sleepEnd: number;
  cleanliness: number;
  noiseTolerance: number;
  cookingFrequency: number;
  guestFrequency: number;
  foodPreference: FoodPreference;
  smokingPreference: SmokingPreference;
  smokingRequired?: boolean;
  alcoholPreference: AlcoholPreference;
  pets?: boolean;
  languageMatters?: boolean;
  localities: string[];
  languages: string[];
  room?: {
    propertyType: PropertyType;
    locality: string;
    exactAddress: string;
    monthlyRent: number;
    roommateContribution: number;
    deposit: number;
    availableFrom: string;
    sharingPermission: SharingPermission;
    roomType: RoomType;
    notes: string;
    amenities: string[];
  };
};

const people: SeedUser[] = [
  {
    email: 'pankaj@fmr.test',
    phone: '9876500001',
    firstName: 'Pankaj',
    age: 28,
    gender: Gender.MALE,
    occupation: 'Software Engineer',
    jobTitle: 'Backend Engineer',
    bio: 'Have a single room in Bellandur. Work at RMZ Ecoworld. Looking for one compatible person to share.',
    workLocation: 'RMZ Ecoworld',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 8000,
    maxBudget: 12000,
    moveInDate: '2026-10-01',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 2,
    guestFrequency: 2,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    languageMatters: true,
    localities: ['Bellandur', 'Kadubeesanahalli'],
    languages: ['English', 'Hindi'],
    room: {
      propertyType: PropertyType.PG,
      locality: 'Bellandur',
      exactAddress: '12th Cross, Bellandur, Bengaluru',
      monthlyRent: 20000,
      roommateContribution: 10000,
      deposit: 30000,
      availableFrom: '2026-10-01',
      sharingPermission: SharingPermission.REQUIRES_APPROVAL,
      roomType: RoomType.SINGLE,
      notes: 'Single room in a managed PG. Sharing needs PG approval. Men only.',
      amenities: ['WiFi', 'AC', 'Attached bathroom', 'Food', 'Housekeeping'],
    },
  },
  {
    email: 'arjun@fmr.test',
    phone: '9876500002',
    firstName: 'Arjun',
    age: 27,
    gender: Gender.MALE,
    occupation: 'Software Engineer',
    jobTitle: 'Frontend Engineer',
    bio: 'Joining RMZ Ecoworld. Want a quiet roommate and a room on the ORR.',
    workLocation: 'RMZ Ecoworld',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.NEED_ROOM,
    minBudget: 8000,
    maxBudget: 12000,
    moveInDate: '2026-10-01',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 3,
    guestFrequency: 2,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'],
    languages: ['English', 'Hindi', 'Kannada'],
  },
  {
    email: 'vivek@fmr.test',
    phone: '9876500005',
    firstName: 'Vivek',
    age: 25,
    gender: Gender.MALE,
    occupation: 'Software Engineer',
    jobTitle: 'SDE-1',
    bio: 'New joiner at Cessna. Need a room near Bellandur without stretching my budget.',
    workLocation: 'Cessna Business Park',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.NEED_ROOM,
    phoneVerified: false,
    minBudget: 7000,
    maxBudget: 11000,
    moveInDate: '2026-10-05',
    sleepStart: 0,
    sleepEnd: 8,
    cleanliness: 3,
    noiseTolerance: 3,
    cookingFrequency: 2,
    guestFrequency: 3,
    foodPreference: FoodPreference.NON_VEGETARIAN,
    smokingPreference: SmokingPreference.OUTSIDE_ONLY,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    pets: true,
    localities: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'],
    languages: ['English', 'Hindi', 'Telugu'],
  },
  {
    email: 'rohan@fmr.test',
    phone: '9876500006',
    firstName: 'Rohan',
    age: 26,
    gender: Gender.MALE,
    occupation: 'DevOps Engineer',
    jobTitle: 'SRE',
    bio: 'Embassy TechVillage commute. Prefer someone who sleeps by midnight.',
    workLocation: 'Embassy TechVillage',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.NEED_ROOM,
    minBudget: 8500,
    maxBudget: 13000,
    moveInDate: '2026-10-03',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 2,
    guestFrequency: 1,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    localities: ['Bellandur', 'Kadubeesanahalli'],
    languages: ['English', 'Hindi', 'Marathi'],
  },
  {
    email: 'karan@fmr.test',
    phone: '9876500007',
    firstName: 'Karan',
    age: 29,
    gender: Gender.MALE,
    occupation: 'Engineering Manager',
    jobTitle: 'EM',
    bio: 'Spare room next to Cessna. Looking for a working professional.',
    workLocation: 'Cessna Business Park',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 9000,
    maxBudget: 13000,
    moveInDate: '2026-10-08',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 4,
    noiseTolerance: 3,
    cookingFrequency: 3,
    guestFrequency: 2,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Kadubeesanahalli', 'Bellandur'],
    languages: ['English', 'Hindi'],
    room: {
      propertyType: PropertyType.APARTMENT,
      locality: 'Kadubeesanahalli',
      exactAddress: 'Outer Ring Road, Kadubeesanahalli',
      monthlyRent: 24000,
      roommateContribution: 12000,
      deposit: 36000,
      availableFrom: '2026-10-08',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: '2BHK, one bedroom free. 10 minutes to Cessna.',
      amenities: ['WiFi', 'AC', 'Furnished', 'Parking', 'Power backup'],
    },
  },
  {
    email: 'dev@fmr.test',
    phone: '9876500008',
    firstName: 'Dev',
    age: 28,
    gender: Gender.MALE,
    occupation: 'QA Engineer',
    jobTitle: 'SDET',
    bio: 'Prestige Tech Park. Have a room in Marathahalli.',
    workLocation: 'Prestige Tech Park',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 8000,
    maxBudget: 12000,
    moveInDate: '2026-10-12',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 3,
    noiseTolerance: 3,
    cookingFrequency: 2,
    guestFrequency: 2,
    foodPreference: FoodPreference.NON_VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Marathahalli', 'Bellandur'],
    languages: ['English', 'Kannada'],
    room: {
      propertyType: PropertyType.PG,
      locality: 'Marathahalli',
      exactAddress: 'Ashwath Nagar, Marathahalli',
      monthlyRent: 18000,
      roommateContribution: 9000,
      deposit: 18000,
      availableFrom: '2026-10-12',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.DOUBLE,
      notes: 'PG double room. Men only. Food included.',
      amenities: ['WiFi', 'Food', 'Laundry', 'Housekeeping'],
    },
  },
  {
    email: 'aditya@fmr.test',
    phone: '9876500009',
    firstName: 'Aditya',
    age: 24,
    gender: Gender.MALE,
    occupation: 'Software Engineer',
    jobTitle: 'SDE-1',
    bio: 'Ecospace intern-to-full-time. Looking near Bellandur.',
    workLocation: 'Ecospace',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.NEED_ROOM,
    minBudget: 7500,
    maxBudget: 11000,
    moveInDate: '2026-10-06',
    sleepStart: 0,
    sleepEnd: 8,
    cleanliness: 3,
    noiseTolerance: 4,
    cookingFrequency: 1,
    guestFrequency: 2,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Bellandur', 'Marathahalli'],
    languages: ['English', 'Hindi'],
  },
  {
    email: 'rahul@fmr.test',
    phone: '9876500003',
    firstName: 'Rahul',
    age: 29,
    gender: Gender.MALE,
    occupation: 'Product Designer',
    jobTitle: 'Designer',
    bio: 'HSR apartment with a spare room. Work around Koramangala.',
    workLocation: 'Koramangala offices',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 10000,
    maxBudget: 15000,
    moveInDate: '2026-10-15',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 5,
    noiseTolerance: 3,
    cookingFrequency: 4,
    guestFrequency: 3,
    foodPreference: FoodPreference.NON_VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    alcoholPreference: AlcoholPreference.YES,
    localities: ['HSR', 'Koramangala'],
    languages: ['English', 'Hindi'],
    room: {
      propertyType: PropertyType.APARTMENT,
      locality: 'HSR',
      exactAddress: '27th Main, HSR Layout',
      monthlyRent: 28000,
      roommateContribution: 14000,
      deposit: 40000,
      availableFrom: '2026-10-15',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: '2BHK apartment. One bedroom available.',
      amenities: ['WiFi', 'AC', 'Attached bathroom', 'Furnished', 'Parking'],
    },
  },
  {
    email: 'nikhil@fmr.test',
    phone: '9876500010',
    firstName: 'Nikhil',
    age: 30,
    gender: Gender.MALE,
    occupation: 'Data Engineer',
    jobTitle: 'DE',
    bio: 'ITPL. Room in Whitefield — farther from ORR offices.',
    workLocation: 'ITPL',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 9000,
    maxBudget: 14000,
    moveInDate: '2026-10-20',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 3,
    guestFrequency: 2,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    localities: ['Whitefield'],
    languages: ['English', 'Hindi', 'Kannada'],
    room: {
      propertyType: PropertyType.APARTMENT,
      locality: 'Whitefield',
      exactAddress: 'ITPL Main Road, Whitefield',
      monthlyRent: 26000,
      roommateContribution: 13000,
      deposit: 39000,
      availableFrom: '2026-10-20',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: 'Walkable to ITPL. Men only.',
      amenities: ['WiFi', 'AC', 'Furnished', 'Geyser', 'Power backup'],
    },
  },
  {
    email: 'sameer@fmr.test',
    phone: '9876500011',
    firstName: 'Sameer',
    age: 27,
    gender: Gender.MALE,
    occupation: 'Support Engineer',
    jobTitle: 'L2 Support',
    bio: 'Electronic City Phase 1. Far from ORR — useful to see ranking.',
    workLocation: 'Electronic City Phase 1',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 7000,
    maxBudget: 10000,
    moveInDate: '2026-10-18',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 3,
    noiseTolerance: 3,
    cookingFrequency: 2,
    guestFrequency: 2,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Electronic City'],
    languages: ['English', 'Hindi'],
    room: {
      propertyType: PropertyType.PG,
      locality: 'Electronic City',
      exactAddress: 'Neeladri Road, Electronic City',
      monthlyRent: 16000,
      roommateContribution: 8000,
      deposit: 16000,
      availableFrom: '2026-10-18',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SHARED,
      notes: 'PG near Phase 1 gate. Men only.',
      amenities: ['WiFi', 'Food', 'Laundry'],
    },
  },
  {
    email: 'priya@fmr.test',
    phone: '9876500004',
    firstName: 'Priya',
    age: 26,
    gender: Gender.FEMALE,
    occupation: 'Data Analyst',
    jobTitle: 'Analyst',
    bio: 'ITPL. Looking for a woman roommate in Whitefield or nearby.',
    workLocation: 'ITPL',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.NEED_ROOM,
    minBudget: 9000,
    maxBudget: 14000,
    moveInDate: '2026-10-10',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 5,
    noiseTolerance: 2,
    cookingFrequency: 3,
    guestFrequency: 1,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    languageMatters: true,
    localities: ['Whitefield', 'Marathahalli'],
    languages: ['English', 'Hindi', 'Tamil'],
  },
  {
    email: 'meera@fmr.test',
    phone: '9876500012',
    firstName: 'Meera',
    age: 27,
    gender: Gender.FEMALE,
    occupation: 'Product Manager',
    jobTitle: 'PM',
    bio: 'Have a room near ITPL. Prefer a tidy working woman.',
    workLocation: 'ITPL',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 10000,
    maxBudget: 15000,
    moveInDate: '2026-10-09',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 5,
    noiseTolerance: 2,
    cookingFrequency: 3,
    guestFrequency: 1,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    localities: ['Whitefield'],
    languages: ['English', 'Hindi', 'Kannada'],
    room: {
      propertyType: PropertyType.APARTMENT,
      locality: 'Whitefield',
      exactAddress: 'Hope Farm Junction, Whitefield',
      monthlyRent: 30000,
      roommateContribution: 15000,
      deposit: 45000,
      availableFrom: '2026-10-09',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: '2BHK, women only. Landlord has approved sharing.',
      amenities: ['WiFi', 'AC', 'Attached bathroom', 'Furnished', 'Housekeeping'],
    },
  },
  {
    email: 'sneha@fmr.test',
    phone: '9876500013',
    firstName: 'Sneha',
    age: 25,
    gender: Gender.FEMALE,
    occupation: 'UX Designer',
    jobTitle: 'Designer',
    bio: 'Graphite / EPIP. Need a room in Whitefield.',
    workLocation: 'EPIP Zone / Graphite India',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.NEED_ROOM,
    minBudget: 8500,
    maxBudget: 13000,
    moveInDate: '2026-10-11',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 2,
    guestFrequency: 2,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Whitefield', 'Marathahalli'],
    languages: ['English', 'Hindi', 'Telugu'],
  },
  {
    email: 'ananya@fmr.test',
    phone: '9876500014',
    firstName: 'Ananya',
    age: 28,
    gender: Gender.FEMALE,
    occupation: 'Consultant',
    jobTitle: 'Consultant',
    bio: 'Spare room in HSR. Work around Koramangala.',
    workLocation: 'Koramangala offices',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 11000,
    maxBudget: 16000,
    moveInDate: '2026-10-14',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 5,
    noiseTolerance: 2,
    cookingFrequency: 4,
    guestFrequency: 2,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    localities: ['HSR', 'Koramangala'],
    languages: ['English', 'Hindi'],
    room: {
      propertyType: PropertyType.APARTMENT,
      locality: 'HSR',
      exactAddress: '17th Cross, HSR Layout',
      monthlyRent: 32000,
      roommateContribution: 16000,
      deposit: 48000,
      availableFrom: '2026-10-14',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: 'Women only. 2BHK with balcony.',
      amenities: ['WiFi', 'AC', 'Furnished', 'Parking', 'Geyser'],
    },
  },
  {
    email: 'kavya@fmr.test',
    phone: '9876500015',
    firstName: 'Kavya',
    age: 26,
    gender: Gender.FEMALE,
    occupation: 'Software Engineer',
    jobTitle: 'SDE-2',
    bio: 'Prestige Tech Park. Room in Marathahalli.',
    workLocation: 'Prestige Tech Park',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 8000,
    maxBudget: 12000,
    moveInDate: '2026-10-13',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 3,
    cookingFrequency: 2,
    guestFrequency: 1,
    foodPreference: FoodPreference.BOTH,
    smokingPreference: SmokingPreference.NO,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['Marathahalli', 'Whitefield'],
    languages: ['English', 'Kannada', 'Tamil'],
    room: {
      propertyType: PropertyType.PG,
      locality: 'Marathahalli',
      exactAddress: 'Kundalahalli gate',
      monthlyRent: 20000,
      roommateContribution: 10000,
      deposit: 20000,
      availableFrom: '2026-10-13',
      sharingPermission: SharingPermission.REQUIRES_APPROVAL,
      roomType: RoomType.DOUBLE,
      notes: 'Women PG. Sharing needs warden approval.',
      amenities: ['WiFi', 'Food', 'Laundry', 'Housekeeping', 'Attached bathroom'],
    },
  },
  {
    email: 'divya@fmr.test',
    phone: '9876500016',
    firstName: 'Divya',
    age: 24,
    gender: Gender.FEMALE,
    occupation: 'Content Strategist',
    jobTitle: 'Writer',
    bio: 'HSR offices. Looking for a woman roommate in HSR or Koramangala.',
    workLocation: 'HSR / BTM offices',
    workMode: WorkMode.HYBRID,
    intent: UserIntent.NEED_ROOM,
    minBudget: 9000,
    maxBudget: 15000,
    moveInDate: '2026-10-16',
    sleepStart: 23,
    sleepEnd: 7,
    cleanliness: 4,
    noiseTolerance: 3,
    cookingFrequency: 3,
    guestFrequency: 2,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.SOCIALLY,
    localities: ['HSR', 'Koramangala'],
    languages: ['English', 'Hindi'],
  },
  {
    email: 'isha@fmr.test',
    phone: '9876500017',
    firstName: 'Isha',
    age: 29,
    gender: Gender.FEMALE,
    occupation: 'HR Business Partner',
    jobTitle: 'HRBP',
    bio: 'Electronic City. Far from Whitefield — should rank lower for ITPL seekers.',
    workLocation: 'Electronic City Phase 1',
    workMode: WorkMode.OFFICE,
    intent: UserIntent.HAVE_ROOM,
    minBudget: 7000,
    maxBudget: 11000,
    moveInDate: '2026-10-22',
    sleepStart: 22,
    sleepEnd: 6,
    cleanliness: 4,
    noiseTolerance: 2,
    cookingFrequency: 3,
    guestFrequency: 1,
    foodPreference: FoodPreference.VEGETARIAN,
    smokingPreference: SmokingPreference.NO,
    smokingRequired: true,
    alcoholPreference: AlcoholPreference.NO,
    localities: ['Electronic City'],
    languages: ['English', 'Hindi', 'Kannada'],
    room: {
      propertyType: PropertyType.PG,
      locality: 'Electronic City',
      exactAddress: 'Doddathoguru, Electronic City',
      monthlyRent: 17000,
      roommateContribution: 8500,
      deposit: 17000,
      availableFrom: '2026-10-22',
      sharingPermission: SharingPermission.YES,
      roomType: RoomType.SINGLE,
      notes: 'Women PG near Phase 1.',
      amenities: ['WiFi', 'Food', 'Laundry'],
    },
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const stale = await prisma.user.findMany({
    where: { email: { endsWith: '@fmr.test' } },
    select: { id: true },
  });
  const staleIds = stale.map((user) => user.id);
  if (staleIds.length) {
    await prisma.message.deleteMany({ where: { senderId: { in: staleIds } } });
    await prisma.conversation.deleteMany({
      where: { OR: [{ userAId: { in: staleIds } }, { userBId: { in: staleIds } }] },
    });
    await prisma.matchReason.deleteMany({
      where: { match: { OR: [{ userAId: { in: staleIds } }, { userBId: { in: staleIds } }] } },
    });
    await prisma.match.deleteMany({
      where: { OR: [{ userAId: { in: staleIds } }, { userBId: { in: staleIds } }] },
    });
    await prisma.interest.deleteMany({
      where: { OR: [{ fromUserId: { in: staleIds } }, { toUserId: { in: staleIds } }] },
    });
    await prisma.block.deleteMany({
      where: { OR: [{ fromUserId: { in: staleIds } }, { toUserId: { in: staleIds } }] },
    });
    await prisma.user.deleteMany({ where: { id: { in: staleIds } } });
  }

  const created: Record<string, { id: string; email: string }> = {};

  for (const person of people) {
    const user = await prisma.user.create({
      data: {
        email: person.email,
        phone: person.phone,
        passwordHash,
        role: person.email === 'admin@fmr.test' ? UserRole.ADMIN : UserRole.USER,
        emailVerified: true,
        phoneVerified: person.phoneVerified ?? true,
        profile: {
          create: {
            firstName: person.firstName,
            age: person.age,
            gender: person.gender,
            occupation: person.occupation,
            jobTitle: person.jobTitle,
            bio: person.bio,
            city: 'Bengaluru',
            workLocation: person.workLocation,
            workMode: person.workMode,
            intent: person.intent,
            onboardingDone: true,
          },
        },
        preferences: {
          create: {
            minBudget: person.minBudget,
            maxBudget: person.maxBudget,
            moveInDate: new Date(person.moveInDate),
            sleepStart: person.sleepStart,
            sleepEnd: person.sleepEnd,
            cleanliness: person.cleanliness,
            noiseTolerance: person.noiseTolerance,
            cookingFrequency: person.cookingFrequency,
            guestFrequency: person.guestFrequency,
            foodPreference: person.foodPreference,
            smokingPreference: person.smokingPreference,
            smokingRequired: person.smokingRequired ?? false,
            alcoholPreference: person.alcoholPreference,
            pets: person.pets ?? false,
            languageMatters: person.languageMatters ?? false,
            localities: person.localities,
          },
        },
        languages: { create: person.languages.map((language) => ({ language })) },
      },
    });
    created[person.firstName.toLowerCase()] = { id: user.id, email: user.email! };

    if (person.room) {
      const pin = {
        Bellandur: { lat: 12.9256, lng: 77.6763 },
        Kadubeesanahalli: { lat: 12.9365, lng: 77.6953 },
        Marathahalli: { lat: 12.9592, lng: 77.6974 },
        Whitefield: { lat: 12.9698, lng: 77.7499 },
        HSR: { lat: 12.9116, lng: 77.6389 },
        Koramangala: { lat: 12.9352, lng: 77.6245 },
        'Electronic City': { lat: 12.839, lng: 77.677 },
      }[person.room.locality];
      await prisma.accommodation.create({
        data: {
          ownerUserId: user.id,
          propertyType: person.room.propertyType,
          locality: person.room.locality,
          exactAddress: person.room.exactAddress,
          latitude: pin?.lat,
          longitude: pin?.lng,
          monthlyRent: person.room.monthlyRent,
          roommateContribution: person.room.roommateContribution,
          deposit: person.room.deposit,
          availableFrom: new Date(person.room.availableFrom),
          sharingPermission: person.room.sharingPermission,
          rooms: {
            create: {
              roomType: person.room.roomType,
              capacity: 2,
              currentOccupants: 1,
              availableSlots: 1,
              furnished: true,
              notes: person.room.notes,
              amenities: { create: person.room.amenities.map((name) => ({ name })) },
            },
          },
        },
      });
    }
  }

  async function like(from: string, to: string) {
    await prisma.interest.create({
      data: { fromUserId: created[from].id, toUserId: created[to].id },
    });
  }

  async function mutual(a: string, b: string, firstMessage: string, reply: string) {
    await like(a, b);
    await like(b, a);
    const [userAId, userBId] = [created[a].id, created[b].id].sort();
    const match = await prisma.match.create({
      data: {
        userAId,
        userBId,
        score: 92,
        status: 'CHAT_STARTED',
        reasons: {
          create: [
            { factor: 'office', kind: 'POSITIVE', score: 1, description: 'Same tech-park corridor' },
            { factor: 'location', kind: 'POSITIVE', score: 1, description: 'Overlapping localities' },
          ],
        },
        conversation: { create: { userAId, userBId } },
      },
      include: { conversation: true },
    });
    await prisma.message.createMany({
      data: [
        { conversationId: match.conversation!.id, senderId: created[a].id, body: firstMessage },
        { conversationId: match.conversation!.id, senderId: created[b].id, body: reply },
      ],
    });
  }

  await mutual(
    'arjun',
    'pankaj',
    'Hey Pankaj, I work at Ecoworld too. Is the PG open to one more person?',
    'Yes — needs warden approval. We can chat here first.',
  );
  await like('vivek', 'arjun');
  await like('rohan', 'pankaj');
  await mutual(
    'priya',
    'meera',
    'Hi Meera, I also work at ITPL. Is the room still free from 10 Oct?',
    'Yes, Whitefield 2BHK, women only. Happy to show photos here.',
  );
  await like('sneha', 'priya');
  await like('divya', 'ananya');

  const arjunPankajMatch = await prisma.match.findFirst({
    where: {
      OR: [
        { userAId: created.arjun.id, userBId: created.pankaj.id },
        { userAId: created.pankaj.id, userBId: created.arjun.id },
      ],
    },
  });
  const pankajRoom = await prisma.room.findFirst({
    where: { accommodation: { ownerUserId: created.pankaj.id } },
    select: { id: true },
  });

  await prisma.user.upsert({
    where: { email: 'admin@fmr.test' },
    update: { role: UserRole.ADMIN },
    create: {
      email: 'admin@fmr.test',
      phone: '9876509999',
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: true,
      phoneVerified: true,
      profile: {
        create: {
          firstName: 'Admin',
          city: 'Bengaluru',
          intent: UserIntent.OTHER,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 0,
          maxBudget: 0,
          localities: ['Bellandur'],
        },
      },
    },
  });

  const demoPgs = [
    {
      ownerUserId: created.pankaj.id,
      title: 'Green Nest PG — Bellandur',
      locality: 'Bellandur',
      monthlyRent: 8900,
      deposit: 15000,
      genderPolicy: PgGenderPolicy.MALE,
      mealsIncluded: true,
      sharingPermission: SharingPermission.REQUIRES_APPROVAL,
      bedsAvailable: 3,
      totalBeds: 14,
      amenities: ['WiFi', 'Food', 'AC', 'Housekeeping'],
      notes: 'Managed PG on ORR. Warden approval needed for sharing.',
      availableFrom: new Date('2026-10-01'),
      sharingOptions: [
        { sharingType: PgSharingType.SINGLE, monthlyRent: 10500, bedsAvailable: 1, totalBeds: 4 },
        { sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, bedsAvailable: 2, totalBeds: 8 },
        { sharingType: PgSharingType.TRIPLE, monthlyRent: 7800, bedsAvailable: 0, totalBeds: 2 },
      ],
      beds: [
        { roomLabel: 'Room 101', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 10500, status: PgBedStatus.AVAILABLE, sortOrder: 0 },
        { roomLabel: 'Room 102', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 10500, status: PgBedStatus.OCCUPIED, sortOrder: 1 },
        { roomLabel: 'Room 103', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 10500, status: PgBedStatus.OCCUPIED, sortOrder: 2 },
        { roomLabel: 'Room 104', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 10500, status: PgBedStatus.OCCUPIED, sortOrder: 3 },
        { roomLabel: 'Room 201', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.AVAILABLE, sortOrder: 4 },
        { roomLabel: 'Room 201', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.AVAILABLE, sortOrder: 5 },
        { roomLabel: 'Room 202', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 6 },
        { roomLabel: 'Room 202', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 7 },
        { roomLabel: 'Room 203', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 8 },
        { roomLabel: 'Room 203', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 9 },
        { roomLabel: 'Room 204', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 10 },
        { roomLabel: 'Room 204', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8900, status: PgBedStatus.OCCUPIED, sortOrder: 11 },
        { roomLabel: 'Room 301', bedLabel: 'A', sharingType: PgSharingType.TRIPLE, monthlyRent: 7800, status: PgBedStatus.OCCUPIED, sortOrder: 12 },
        { roomLabel: 'Room 301', bedLabel: 'B', sharingType: PgSharingType.TRIPLE, monthlyRent: 7800, status: PgBedStatus.OCCUPIED, sortOrder: 13 },
      ],
    },
    {
      ownerUserId: created.priya.id,
      title: 'Sunrise Ladies PG — Whitefield',
      locality: 'Whitefield',
      monthlyRent: 8200,
      deposit: 12000,
      genderPolicy: PgGenderPolicy.FEMALE,
      mealsIncluded: true,
      sharingPermission: SharingPermission.YES,
      bedsAvailable: 2,
      totalBeds: 8,
      amenities: ['WiFi', 'Food', 'Laundry'],
      notes: 'Near ITPL. Quiet hours after 10 PM.',
      availableFrom: new Date('2026-10-10'),
      sharingOptions: [
        { sharingType: PgSharingType.SINGLE, monthlyRent: 9800, bedsAvailable: 1, totalBeds: 2 },
        { sharingType: PgSharingType.DOUBLE, monthlyRent: 8200, bedsAvailable: 1, totalBeds: 4 },
        { sharingType: PgSharingType.TRIPLE, monthlyRent: 7200, bedsAvailable: 0, totalBeds: 2 },
      ],
      beds: [
        { roomLabel: 'Room 11', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 9800, status: PgBedStatus.AVAILABLE, sortOrder: 0 },
        { roomLabel: 'Room 12', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 9800, status: PgBedStatus.OCCUPIED, sortOrder: 1 },
        { roomLabel: 'Room 21', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8200, status: PgBedStatus.AVAILABLE, sortOrder: 2 },
        { roomLabel: 'Room 21', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8200, status: PgBedStatus.OCCUPIED, sortOrder: 3 },
        { roomLabel: 'Room 22', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 8200, status: PgBedStatus.OCCUPIED, sortOrder: 4 },
        { roomLabel: 'Room 22', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 8200, status: PgBedStatus.OCCUPIED, sortOrder: 5 },
        { roomLabel: 'Room 31', bedLabel: 'A', sharingType: PgSharingType.TRIPLE, monthlyRent: 7200, status: PgBedStatus.OCCUPIED, sortOrder: 6 },
        { roomLabel: 'Room 31', bedLabel: 'B', sharingType: PgSharingType.TRIPLE, monthlyRent: 7200, status: PgBedStatus.OCCUPIED, sortOrder: 7 },
      ],
    },
    {
      ownerUserId: created.rahul.id,
      title: 'HSR Co-living Beds',
      locality: 'HSR',
      monthlyRent: 9000,
      deposit: 18000,
      genderPolicy: PgGenderPolicy.ANY,
      mealsIncluded: false,
      sharingPermission: SharingPermission.YES,
      bedsAvailable: 4,
      totalBeds: 14,
      amenities: ['WiFi', 'Kitchen', 'Laundry'],
      notes: 'Co-living with shared kitchen. Good for small groups.',
      availableFrom: new Date('2026-10-15'),
      sharingOptions: [
        { sharingType: PgSharingType.SINGLE, monthlyRent: 12000, bedsAvailable: 1, totalBeds: 2 },
        { sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, bedsAvailable: 2, totalBeds: 8 },
        { sharingType: PgSharingType.TRIPLE, monthlyRent: 7500, bedsAvailable: 1, totalBeds: 4 },
      ],
      beds: [
        { roomLabel: 'Room A1', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 12000, status: PgBedStatus.AVAILABLE, sortOrder: 0 },
        { roomLabel: 'Room A2', bedLabel: 'A', sharingType: PgSharingType.SINGLE, monthlyRent: 12000, status: PgBedStatus.OCCUPIED, sortOrder: 1 },
        { roomLabel: 'Room B1', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.AVAILABLE, sortOrder: 2 },
        { roomLabel: 'Room B1', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.AVAILABLE, sortOrder: 3 },
        { roomLabel: 'Room B2', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 4 },
        { roomLabel: 'Room B2', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 5 },
        { roomLabel: 'Room B3', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 6 },
        { roomLabel: 'Room B3', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 7 },
        { roomLabel: 'Room B4', bedLabel: 'A', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 8 },
        { roomLabel: 'Room B4', bedLabel: 'B', sharingType: PgSharingType.DOUBLE, monthlyRent: 9000, status: PgBedStatus.OCCUPIED, sortOrder: 9 },
        { roomLabel: 'Room C1', bedLabel: 'A', sharingType: PgSharingType.TRIPLE, monthlyRent: 7500, status: PgBedStatus.AVAILABLE, sortOrder: 10 },
        { roomLabel: 'Room C1', bedLabel: 'B', sharingType: PgSharingType.TRIPLE, monthlyRent: 7500, status: PgBedStatus.OCCUPIED, sortOrder: 11 },
        { roomLabel: 'Room C1', bedLabel: 'C', sharingType: PgSharingType.TRIPLE, monthlyRent: 7500, status: PgBedStatus.OCCUPIED, sortOrder: 12 },
        { roomLabel: 'Room C2', bedLabel: 'A', sharingType: PgSharingType.TRIPLE, monthlyRent: 7500, status: PgBedStatus.OCCUPIED, sortOrder: 13 },
      ],
    },
  ];

  for (const pg of demoPgs) {
    const { sharingOptions, beds, ...listing } = pg;
    await prisma.pgListing.create({
      data: {
        ...listing,
        sharingOptions: { create: sharingOptions },
        beds: { create: beds },
      },
    });
  }

  await prisma.user.updateMany({
    where: { id: { in: [created.pankaj.id, created.priya.id, created.rahul.id] } },
    data: { role: UserRole.PG_OWNER },
  });

  const flatGroup = await prisma.flatGroup.create({
    data: {
      createdById: created.arjun.id,
      title: 'Ecoworld flatmates — 3BHK hunt',
      targetSize: 3,
      targetRentEach: 11000,
      localities: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'],
      moveInDate: new Date('2026-10-01'),
      notes: 'Office at RMZ Ecoworld. Prefer vegetarian kitchen.',
      status: FlatGroupStatus.FORMING,
      members: {
        create: [
          { userId: created.arjun.id, role: GroupMemberRole.OWNER, status: GroupMemberStatus.JOINED },
          { userId: created.vivek.id, role: GroupMemberRole.MEMBER, status: GroupMemberStatus.INVITED },
        ],
      },
    },
  });

  if (pankajRoom) {
    await prisma.replacement.create({
      data: {
        roomId: pankajRoom.id,
        createdById: created.pankaj.id,
        departingName: 'Former flatmate',
        leaveDate: new Date('2026-11-01'),
        notes: 'PG allows one replacement with warden approval. Same rent split.',
        status: ReplacementStatus.OPEN,
      },
    });
  }

  if (arjunPankajMatch) {
    await prisma.agreement.create({
      data: {
        matchId: arjunPankajMatch.id,
        roomId: pankajRoom?.id,
        createdById: created.pankaj.id,
        counterpartyId: created.arjun.id,
        rentEach: 10000,
        electricity: '50/50',
        internet: 'Included in PG rent',
        cleaning: 'PG housekeeping',
        groceries: 'Separate',
        guests: 'Notify beforehand',
        quietHours: '11 PM–7 AM',
        notes: 'Draft terms from Pankaj — Arjun still needs to confirm.',
        creatorConfirmed: true,
        otherConfirmed: false,
      },
    });
  }

  console.log('Seeded Alaya demo accounts (password Password123!)');
  console.log(`Living: PG listings, flat group ${flatGroup.id}, replacement + agreement demos`);
  console.log('Men / ORR: arjun, pankaj, vivek, rohan, karan, dev, aditya');
  console.log('Men / farther: rahul (HSR), nikhil (Whitefield), sameer (EC)');
  console.log('Women / Whitefield: priya, meera, sneha, kavya');
  console.log('Women / farther: ananya (HSR), divya (HSR), isha (EC)');
  console.log('Demo: sign in as arjun@fmr.test — same-gender, Ecoworld-first ranking, existing chat with Pankaj.');
  console.log('PG operators: pankaj@fmr.test, priya@fmr.test, rahul@fmr.test → /operator dashboard');
  console.log('Admin: admin@fmr.test → /operator dashboard (admin tools later)');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
