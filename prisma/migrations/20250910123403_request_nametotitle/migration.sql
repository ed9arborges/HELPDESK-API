/*
  Warnings:

  - You are about to drop the column `name` on the `requests` table. All the data in the column will be lost.
  - Added the required column `title` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."requests" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
