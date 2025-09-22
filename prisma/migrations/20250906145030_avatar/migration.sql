/*
  Warnings:

  - You are about to drop the column `filename` on the `users` table. All the data in the column will be lost.
  - Added the required column `avatarImg` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "filename",
ADD COLUMN     "avatarImg" TEXT NOT NULL;
