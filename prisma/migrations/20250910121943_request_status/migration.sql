-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('open', 'in_progress', 'closed');

-- AlterTable
ALTER TABLE "public"."requests" ADD COLUMN     "status" "public"."RequestStatus" NOT NULL DEFAULT 'open';
