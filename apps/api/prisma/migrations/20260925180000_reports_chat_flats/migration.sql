-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE');
CREATE TYPE "ReportTargetKind" AS ENUM ('USER', 'ROOM', 'PG', 'FLAT');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED');
CREATE TYPE "FlatBhk" AS ENUM ('TWO_BHK', 'THREE_BHK');
CREATE TYPE "FlatListingStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterTable Message
ALTER TABLE "Message" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'TEXT';
ALTER TABLE "Message" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "Message" ALTER COLUMN "body" SET DEFAULT '';

-- AlterTable Interest
ALTER TABLE "Interest" ADD COLUMN "pgListingId" TEXT;
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_pgListingId_fkey" FOREIGN KEY ("pgListingId") REFERENCES "PgListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable Report
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetKind" "ReportTargetKind" NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable FlatListing
CREATE TABLE "FlatListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Bengaluru',
    "bhk" "FlatBhk" NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "deposit" INTEGER,
    "furnished" BOOLEAN NOT NULL DEFAULT false,
    "photos" TEXT[],
    "amenities" TEXT[],
    "notes" TEXT,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "FlatListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "listedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlatListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX "Report_targetKind_targetId_idx" ON "Report"("targetKind", "targetId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlatListing" ADD CONSTRAINT "FlatListing_listedById_fkey" FOREIGN KEY ("listedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
