/*
  Warnings:

  - You are about to drop the column `date` on the `WorkoutEntry` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `WorkoutEntry` table. All the data in the column will be lost.
  - Added the required column `workoutSessionId` to the `WorkoutEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutEntry" DROP COLUMN "date",
DROP COLUMN "weight",
ADD COLUMN     "repsTarget" TEXT,
ADD COLUMN     "weightSuggestion" DOUBLE PRECISION,
ADD COLUMN     "weightUsed" DOUBLE PRECISION,
ADD COLUMN     "workoutSessionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "equipment" TEXT NOT NULL,
    "sessionMinutes" INTEGER NOT NULL,
    "limitations" TEXT,
    "painAreas" TEXT[],
    "weightKg" DOUBLE PRECISION,
    "heightCm" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "dayName" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutSession_userProfileId_sessionDate_idx" ON "WorkoutSession"("userProfileId", "sessionDate");

-- CreateIndex
CREATE INDEX "WorkoutEntry_workoutSessionId_setNumber_idx" ON "WorkoutEntry"("workoutSessionId", "setNumber");

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEntry" ADD CONSTRAINT "WorkoutEntry_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
