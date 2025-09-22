/*
  Warnings:

  - You are about to drop the column `request_id` on the `services` table. All the data in the column will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TicketsStatus" AS ENUM ('open', 'in_progress', 'closed');

-- DropForeignKey
ALTER TABLE "public"."requests" DROP CONSTRAINT "requests_tech_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."requests" DROP CONSTRAINT "requests_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."services" DROP CONSTRAINT "services_request_id_fkey";

-- AlterTable
ALTER TABLE "public"."services" DROP COLUMN "request_id",
ADD COLUMN     "ticket_id" TEXT;

-- DropTable
DROP TABLE "public"."requests";

-- DropEnum
DROP TYPE "public"."RequestStatus";

-- CreateTable
CREATE TABLE "public"."tickets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimate" DOUBLE PRECISION NOT NULL,
    "category" "public"."Category" NOT NULL,
    "filename" TEXT NOT NULL,
    "status" "public"."TicketsStatus" NOT NULL DEFAULT 'open',
    "user_id" TEXT NOT NULL,
    "tech_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."services" ADD CONSTRAINT "services_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
