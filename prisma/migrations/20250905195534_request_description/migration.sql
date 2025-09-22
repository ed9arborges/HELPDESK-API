/*
  Warnings:

  - Added the required column `description` to the `requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."requests" ADD COLUMN     "description" TEXT NOT NULL;
