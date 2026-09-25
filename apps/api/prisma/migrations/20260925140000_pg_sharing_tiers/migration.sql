-- CreateEnum
CREATE TYPE "PgSharingType" AS ENUM ('SINGLE', 'DOUBLE', 'TRIPLE');

-- CreateTable
CREATE TABLE "PgSharingOption" (
    "id" TEXT NOT NULL,
    "pgListingId" TEXT NOT NULL,
    "sharingType" "PgSharingType" NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "bedsAvailable" INTEGER NOT NULL DEFAULT 0,
    "totalBeds" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PgSharingOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PgSharingOption_pgListingId_sharingType_key" ON "PgSharingOption"("pgListingId", "sharingType");

-- AddForeignKey
ALTER TABLE "PgSharingOption" ADD CONSTRAINT "PgSharingOption_pgListingId_fkey" FOREIGN KEY ("pgListingId") REFERENCES "PgListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill single-sharing tier from existing listings
INSERT INTO "PgSharingOption" ("id", "pgListingId", "sharingType", "monthlyRent", "bedsAvailable", "totalBeds")
SELECT
    'ps_' || "id",
    "id",
    'SINGLE',
    "monthlyRent",
    "bedsAvailable",
    "totalBeds"
FROM "PgListing";

-- Add double and triple tiers with zero vacancy (owners can enable later)
INSERT INTO "PgSharingOption" ("id", "pgListingId", "sharingType", "monthlyRent", "bedsAvailable", "totalBeds")
SELECT
    'pd_' || "id",
    "id",
    'DOUBLE',
    GREATEST(ROUND("monthlyRent" * 0.85), 1000),
    0,
    0
FROM "PgListing";

INSERT INTO "PgSharingOption" ("id", "pgListingId", "sharingType", "monthlyRent", "bedsAvailable", "totalBeds")
SELECT
    'pt_' || "id",
    "id",
    'TRIPLE',
    GREATEST(ROUND("monthlyRent" * 0.75), 1000),
    0,
    0
FROM "PgListing";
