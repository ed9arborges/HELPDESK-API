/*
  Custom migration to split catalog services from extras.

  Steps:
  1) Create category_services table
  2) Add nullable service_id to tickets
  3) Backfill category_services with rows from services where is_basic=true and ticket_id IS NULL
  4) Backfill tickets.service_id from tickets.basic_service_id when present
  5) Remove moved catalog rows from services
  6) Enforce NOT NULL on services.ticket_id and tickets.service_id
  7) Drop legacy columns/constraints and add new FKs
*/

-- 1) Create category_services
CREATE TABLE IF NOT EXISTS "public"."category_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "category_services_pkey" PRIMARY KEY ("id")
);

-- 2) Add nullable service_id to tickets if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE "public"."tickets" ADD COLUMN "service_id" TEXT;
  END IF;
END$$;

-- 3) Move catalog basic services into category_services (preserve IDs)
INSERT INTO "public"."category_services" ("id", "name", "amount", "created_at", "updated_at")
SELECT s."id", s."name", s."amount", s."created_at", s."updated_at"
FROM "public"."services" s
WHERE (s."is_basic" = true OR s."is_basic" = 't') AND s."ticket_id" IS NULL
ON CONFLICT ("id") DO NOTHING;

-- 4) Backfill tickets.service_id from existing basic_service_id if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'basic_service_id'
  ) THEN
    UPDATE "public"."tickets" t
    SET "service_id" = t."basic_service_id"
    WHERE t."service_id" IS NULL AND t."basic_service_id" IS NOT NULL;
  END IF;
END$$;

-- 5) Remove moved catalog rows from services
DELETE FROM "public"."services" s
WHERE (s."is_basic" = true OR s."is_basic" = 't') AND s."ticket_id" IS NULL;

-- 6a) Drop old FK to allow altering nullability safely (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'services' AND constraint_name = 'services_ticket_id_fkey'
  ) THEN
    ALTER TABLE "public"."services" DROP CONSTRAINT "services_ticket_id_fkey";
  END IF;
END$$;

-- 6b) Enforce NOT NULL on services.ticket_id now that catalog rows are moved
ALTER TABLE "public"."services" ALTER COLUMN "ticket_id" SET NOT NULL;

-- 6c) Enforce NOT NULL on tickets.service_id (all rows should be backfilled)
ALTER TABLE "public"."tickets" ALTER COLUMN "service_id" SET NOT NULL;

-- 7) Drop legacy column is_basic and add new FKs
ALTER TABLE "public"."services" DROP COLUMN IF EXISTS "is_basic";

-- Add new FKs (conditionally)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'tickets' AND constraint_name = 'tickets_service_id_fkey'
  ) THEN
    ALTER TABLE "public"."tickets" ADD CONSTRAINT "tickets_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."category_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'services' AND constraint_name = 'services_ticket_id_fkey'
  ) THEN
    ALTER TABLE "public"."services" ADD CONSTRAINT "services_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

-- Drop legacy FK and column basic_service_id if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'tickets' AND constraint_name = 'tickets_basic_service_id_fkey'
  ) THEN
    ALTER TABLE "public"."tickets" DROP CONSTRAINT "tickets_basic_service_id_fkey";
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tickets' AND column_name = 'basic_service_id'
  ) THEN
    ALTER TABLE "public"."tickets" DROP COLUMN "basic_service_id";
  END IF;
END$$;

-- Optional: drop obsolete enum if it still exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Category') THEN
    DROP TYPE "public"."Category";
  END IF;
END$$;
