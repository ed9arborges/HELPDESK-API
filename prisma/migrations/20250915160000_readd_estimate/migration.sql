-- Reintroduce estimate column on tickets if it was dropped
-- Using DO block to avoid failure if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tickets' AND column_name = 'estimate'
  ) THEN
    ALTER TABLE "public"."tickets" ADD COLUMN "estimate" DOUBLE PRECISION;
    -- initialize to 0 where null
    UPDATE "public"."tickets" SET "estimate" = 0 WHERE "estimate" IS NULL;
    -- make not null
    ALTER TABLE "public"."tickets" ALTER COLUMN "estimate" SET NOT NULL;
  END IF;
END $$;
