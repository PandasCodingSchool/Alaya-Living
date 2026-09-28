-- Optional: applies when Postgres has PostGIS (postgis/postgis Docker image).
-- On plain postgres:16 this migration is skipped automatically if extension is missing.

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'PostGIS extension unavailable — skipping geography columns';
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
    ALTER TABLE "Accommodation" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);
    ALTER TABLE "PgListing" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);
    ALTER TABLE "FlatListing" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

    CREATE INDEX IF NOT EXISTS "Accommodation_location_idx" ON "Accommodation" USING GIST ("location");
    CREATE INDEX IF NOT EXISTS "PgListing_location_idx" ON "PgListing" USING GIST ("location");
    CREATE INDEX IF NOT EXISTS "FlatListing_location_idx" ON "FlatListing" USING GIST ("location");

    UPDATE "Accommodation"
    SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
    WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL AND "location" IS NULL;

    UPDATE "PgListing"
    SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
    WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL AND "location" IS NULL;

    UPDATE "FlatListing"
    SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
    WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL AND "location" IS NULL;
  END IF;
END $$;
