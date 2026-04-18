/*
  Warnings:

  - You are about to drop the column `weightUsed` on the `WorkoutEntry` table. All the data in the column will be lost.
  - Added the required column `date` to the `WorkoutEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WorkoutEntry" DROP COLUMN "weightUsed",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION;
