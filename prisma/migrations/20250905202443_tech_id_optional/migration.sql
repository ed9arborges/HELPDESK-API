-- DropForeignKey
ALTER TABLE "public"."parts" DROP CONSTRAINT "parts_request_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."requests" DROP CONSTRAINT "requests_tech_id_fkey";

-- AlterTable
ALTER TABLE "public"."parts" ALTER COLUMN "request_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."requests" ALTER COLUMN "tech_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_tech_id_fkey" FOREIGN KEY ("tech_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parts" ADD CONSTRAINT "parts_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
