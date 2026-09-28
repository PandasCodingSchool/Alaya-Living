-- AlterEnum
ALTER TYPE "BookmarkKind" ADD VALUE 'PG';
ALTER TYPE "BookmarkKind" ADD VALUE 'FLAT';

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INTEREST_RECEIVED', 'MATCH', 'MESSAGE', 'PG_INQUIRY');
CREATE TYPE "SavedSearchKind" AS ENUM ('PEOPLE', 'ROOMS', 'PGS', 'FLATS');
CREATE TYPE "ReviewTargetKind" AS ENUM ('USER', 'PG', 'FLAT', 'ROOM');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "SavedSearchKind" NOT NULL,
    "filters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "targetKind" "ReviewTargetKind" NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "SavedSearch_userId_createdAt_idx" ON "SavedSearch"("userId", "createdAt");
CREATE UNIQUE INDEX "Review_reviewerId_targetKind_targetId_key" ON "Review"("reviewerId", "targetKind", "targetId");
CREATE INDEX "Review_targetKind_targetId_idx" ON "Review"("targetKind", "targetId");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
