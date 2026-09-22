import {
  AlcoholPreference,
  FoodPreference,
  Gender,
  PrismaClient,
  PropertyType,
  RoomType,
  SharingPermission,
  SmokingPreference,
  UserIntent,
  WorkMode,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log('Seed skipped — users already exist');
    return;
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.matchReason.deleteMany();
  await prisma.match.deleteMany();
  await prisma.interest.deleteMany();
  await prisma.block.deleteMany();
  await prisma.roomAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.accommodation.deleteMany();
  await prisma.userLanguage.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const pankaj = await prisma.user.create({
    data: {
      email: 'pankaj@fmr.test',
      phone: '9876500001',
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      profile: {
        create: {
          firstName: 'Pankaj',
          age: 28,
          gender: Gender.MALE,
          occupation: 'Software Engineer',
          jobTitle: 'Backend Engineer',
          bio: 'Have a single room in Bellandur and looking for one compatible person to share it with.',
          city: 'Bengaluru',
          workLocation: 'Bellandur',
          workMode: WorkMode.HYBRID,
          intent: UserIntent.HAVE_ROOM,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 8000,
          maxBudget: 12000,
          moveInDate: new Date('2026-10-01'),
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
          pets: false,
          languageMatters: true,
          localities: ['Bellandur', 'Kadubeesanahalli'],
        },
      },
      languages: { create: [{ language: 'English' }, { language: 'Hindi' }] },
    },
  });

  const arjun = await prisma.user.create({
    data: {
      email: 'arjun@fmr.test',
      phone: '9876500002',
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      profile: {
        create: {
          firstName: 'Arjun',
          age: 27,
          gender: Gender.MALE,
          occupation: 'Software Engineer',
          jobTitle: 'Frontend Engineer',
          bio: 'Joining a team in Bellandur. Looking for a quiet, compatible roommate and an affordable room.',
          city: 'Bengaluru',
          workLocation: 'Bellandur',
          workMode: WorkMode.OFFICE,
          intent: UserIntent.NEED_ROOM,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 8000,
          maxBudget: 12000,
          moveInDate: new Date('2026-10-01'),
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
          pets: false,
          languageMatters: false,
          localities: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'],
        },
      },
      languages: { create: [{ language: 'English' }, { language: 'Hindi' }, { language: 'Kannada' }] },
    },
  });

  const rahul = await prisma.user.create({
    data: {
      email: 'rahul@fmr.test',
      phone: '9876500003',
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      profile: {
        create: {
          firstName: 'Rahul',
          age: 29,
          gender: Gender.MALE,
          occupation: 'Product Designer',
          jobTitle: 'Designer',
          bio: 'HSR apartment with a spare room. Prefer someone tidy who works typical office hours.',
          city: 'Bengaluru',
          workLocation: 'Koramangala',
          workMode: WorkMode.HYBRID,
          intent: UserIntent.HAVE_ROOM,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 10000,
          maxBudget: 15000,
          moveInDate: new Date('2026-10-15'),
          sleepStart: 22,
          sleepEnd: 6,
          cleanliness: 5,
          noiseTolerance: 3,
          cookingFrequency: 4,
          guestFrequency: 3,
          foodPreference: FoodPreference.NON_VEGETARIAN,
          smokingPreference: SmokingPreference.NO,
          alcoholPreference: AlcoholPreference.YES,
          pets: false,
          languageMatters: false,
          localities: ['HSR', 'Koramangala'],
        },
      },
      languages: { create: [{ language: 'English' }, { language: 'Hindi' }] },
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: 'priya@fmr.test',
      phone: '9876500004',
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      profile: {
        create: {
          firstName: 'Priya',
          age: 26,
          gender: Gender.FEMALE,
          occupation: 'Data Analyst',
          jobTitle: 'Analyst',
          bio: 'Moving to Whitefield and looking for a compatible roommate in a well-connected locality.',
          city: 'Bengaluru',
          workLocation: 'Whitefield',
          workMode: WorkMode.HYBRID,
          intent: UserIntent.NEED_ROOM,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 9000,
          maxBudget: 14000,
          moveInDate: new Date('2026-10-10'),
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
          pets: false,
          languageMatters: true,
          localities: ['Whitefield', 'HSR', 'Marathahalli'],
        },
      },
      languages: { create: [{ language: 'English' }, { language: 'Hindi' }, { language: 'Tamil' }] },
    },
  });

  const vivek = await prisma.user.create({
    data: {
      email: 'vivek@fmr.test',
      phone: '9876500005',
      passwordHash,
      emailVerified: true,
      phoneVerified: false,
      profile: {
        create: {
          firstName: 'Vivek',
          age: 25,
          gender: Gender.MALE,
          occupation: 'Software Engineer',
          jobTitle: 'SDE-1',
          bio: 'New joiner. Need a room near Bellandur without stretching my budget.',
          city: 'Bengaluru',
          workLocation: 'Kadubeesanahalli',
          workMode: WorkMode.OFFICE,
          intent: UserIntent.NEED_ROOM,
          onboardingDone: true,
        },
      },
      preferences: {
        create: {
          minBudget: 7000,
          maxBudget: 11000,
          moveInDate: new Date('2026-10-05'),
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
          languageMatters: false,
          localities: ['Bellandur', 'Kadubeesanahalli', 'Marathahalli'],
        },
      },
      languages: { create: [{ language: 'English' }, { language: 'Hindi' }, { language: 'Telugu' }] },
    },
  });

  await prisma.accommodation.create({
    data: {
      ownerUserId: pankaj.id,
      propertyType: PropertyType.PG,
      locality: 'Bellandur',
      exactAddress: '12th Cross, Bellandur, Bengaluru',
      monthlyRent: 20000,
      roommateContribution: 10000,
      deposit: 30000,
      availableFrom: new Date('2026-10-01'),
      sharingPermission: SharingPermission.REQUIRES_APPROVAL,
      rooms: {
        create: {
          roomType: RoomType.SINGLE,
          capacity: 2,
          currentOccupants: 1,
          availableSlots: 1,
          furnished: true,
          notes: 'Single room in a managed PG. Sharing needs PG approval.',
          amenities: {
            create: [
              { name: 'WiFi' },
              { name: 'AC' },
              { name: 'Attached bathroom' },
              { name: 'Food' },
              { name: 'Housekeeping' },
            ],
          },
        },
      },
    },
  });

  await prisma.accommodation.create({
    data: {
      ownerUserId: rahul.id,
      propertyType: PropertyType.APARTMENT,
      locality: 'HSR',
      exactAddress: '27th Main, HSR Layout',
      monthlyRent: 28000,
      roommateContribution: 14000,
      deposit: 40000,
      availableFrom: new Date('2026-10-15'),
      sharingPermission: SharingPermission.YES,
      rooms: {
        create: {
          roomType: RoomType.SINGLE,
          capacity: 2,
          currentOccupants: 1,
          availableSlots: 1,
          furnished: true,
          notes: '2BHK apartment. One bedroom available.',
          amenities: {
            create: [
              { name: 'WiFi' },
              { name: 'AC' },
              { name: 'Attached bathroom' },
              { name: 'Furnished' },
              { name: 'Parking' },
            ],
          },
        },
      },
    },
  });

  console.log('Seeded users:', {
    pankaj: pankaj.email,
    arjun: arjun.email,
    rahul: rahul.email,
    priya: priya.email,
    vivek: vivek.email,
    password: 'Password123!',
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
