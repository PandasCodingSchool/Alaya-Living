-- CreateEnum
CREATE TYPE "PgBedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED');

-- CreateTable
CREATE TABLE "PgBed" (
    "id" TEXT NOT NULL,
    "pgListingId" TEXT NOT NULL,
    "roomLabel" TEXT NOT NULL,
    "bedLabel" TEXT NOT NULL,
    "sharingType" "PgSharingType" NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "status" "PgBedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PgBed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PgBed_pgListingId_roomLabel_bedLabel_key" ON "PgBed"("pgListingId", "roomLabel", "bedLabel");

-- AddForeignKey
ALTER TABLE "PgBed" ADD CONSTRAINT "PgBed_pgListingId_fkey" FOREIGN KEY ("pgListingId") REFERENCES "PgListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill beds from existing sharing tier counts
INSERT INTO "PgBed" ("id", "pgListingId", "roomLabel", "bedLabel", "sharingType", "monthlyRent", "status", "sortOrder")
SELECT
  'bed_' || so."id" || '_' || gs::text,
  so."pgListingId",
  CASE so."sharingType"
    WHEN 'SINGLE' THEN 'Single · Room ' || gs::text
    WHEN 'DOUBLE' THEN 'Double · Room ' || (((gs - 1) / 2) + 1)::text
    WHEN 'TRIPLE' THEN 'Triple · Room ' || (((gs - 1) / 3) + 1)::text
  END,
  CASE so."sharingType"
    WHEN 'SINGLE' THEN 'A'
    WHEN 'DOUBLE' THEN chr(65 + ((gs - 1) % 2))
    WHEN 'TRIPLE' THEN chr(65 + ((gs - 1) % 3))
  END,
  so."sharingType",
  so."monthlyRent",
  CASE WHEN gs <= so."bedsAvailable" THEN 'AVAILABLE'::"PgBedStatus" ELSE 'OCCUPIED'::"PgBedStatus" END,
  gs - 1
FROM "PgSharingOption" so
CROSS JOIN generate_series(1, so."totalBeds") gs
WHERE so."totalBeds" > 0;
