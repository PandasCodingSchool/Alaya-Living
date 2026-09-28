ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SAVED_SEARCH_MATCH';

CREATE TYPE "VerificationKind" AS ENUM ('IDENTITY', 'EMPLOYMENT', 'PROPERTY');
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "FlatListing" ADD COLUMN IF NOT EXISTS "exactAddress" TEXT;

CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "VerificationKind" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "pgListingId" TEXT,
    "flatListingId" TEXT,
    "documentRef" TEXT,
    "notes" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Verification_status_createdAt_idx" ON "Verification"("status", "createdAt");
CREATE INDEX "Verification_userId_kind_idx" ON "Verification"("userId", "kind");

ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_pgListingId_fkey" FOREIGN KEY ("pgListingId") REFERENCES "PgListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_flatListingId_fkey" FOREIGN KEY ("flatListingId") REFERENCES "FlatListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;
