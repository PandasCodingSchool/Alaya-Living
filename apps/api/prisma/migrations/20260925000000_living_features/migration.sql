CREATE TYPE "AgreementStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
CREATE TYPE "ReplacementStatus" AS ENUM ('OPEN', 'FILLED', 'CLOSED');
CREATE TYPE "FlatGroupStatus" AS ENUM ('FORMING', 'COMPLETE', 'SEARCHING', 'CLOSED');
CREATE TYPE "GroupMemberRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "GroupMemberStatus" AS ENUM ('INVITED', 'JOINED', 'LEFT');
CREATE TYPE "PgGenderPolicy" AS ENUM ('MALE', 'FEMALE', 'ANY');

CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "roomId" TEXT,
    "createdById" TEXT NOT NULL,
    "counterpartyId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "rentEach" INTEGER NOT NULL,
    "electricity" TEXT NOT NULL DEFAULT '50/50',
    "internet" TEXT NOT NULL DEFAULT '50/50',
    "cleaning" TEXT NOT NULL DEFAULT 'Alternate weekly',
    "groceries" TEXT NOT NULL DEFAULT 'Separate',
    "guests" TEXT NOT NULL DEFAULT 'Notify beforehand',
    "quietHours" TEXT NOT NULL DEFAULT '11 PM–7 AM',
    "notes" TEXT,
    "creatorConfirmed" BOOLEAN NOT NULL DEFAULT true,
    "otherConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Agreement_matchId_key" ON "Agreement"("matchId");

ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_counterpartyId_fkey" FOREIGN KEY ("counterpartyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Replacement" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "departingName" TEXT NOT NULL,
    "leaveDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "ReplacementStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Replacement_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Replacement" ADD CONSTRAINT "Replacement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FlatGroup" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetSize" INTEGER NOT NULL,
    "targetRentEach" INTEGER NOT NULL,
    "localities" TEXT[],
    "moveInDate" TIMESTAMP(3),
    "notes" TEXT,
    "status" "FlatGroupStatus" NOT NULL DEFAULT 'FORMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlatGroup_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FlatGroup" ADD CONSTRAINT "FlatGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FlatGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GroupMemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "GroupMemberStatus" NOT NULL DEFAULT 'INVITED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlatGroupMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FlatGroupMember_groupId_userId_key" ON "FlatGroupMember"("groupId", "userId");

ALTER TABLE "FlatGroupMember" ADD CONSTRAINT "FlatGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "FlatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlatGroupMember" ADD CONSTRAINT "FlatGroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "PgListing" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Bengaluru',
    "propertyType" "PropertyType" NOT NULL DEFAULT 'PG',
    "monthlyRent" INTEGER NOT NULL,
    "deposit" INTEGER,
    "genderPolicy" "PgGenderPolicy" NOT NULL DEFAULT 'ANY',
    "mealsIncluded" BOOLEAN NOT NULL DEFAULT false,
    "sharingPermission" "SharingPermission" NOT NULL DEFAULT 'YES',
    "bedsAvailable" INTEGER NOT NULL DEFAULT 1,
    "totalBeds" INTEGER NOT NULL DEFAULT 4,
    "photos" TEXT[],
    "amenities" TEXT[],
    "notes" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "exactAddress" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "RoomStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PgListing_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "PgListing" ADD CONSTRAINT "PgListing_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
