ALTER TABLE "Preference" ADD COLUMN IF NOT EXISTS "preferredRadiusKm" INTEGER NOT NULL DEFAULT 5;

UPDATE "Accommodation" SET
  "latitude" = CASE "locality"
    WHEN 'Bellandur' THEN 12.9256
    WHEN 'Kadubeesanahalli' THEN 12.9365
    WHEN 'Marathahalli' THEN 12.9592
    WHEN 'Whitefield' THEN 12.9698
    WHEN 'HSR' THEN 12.9116
    WHEN 'Koramangala' THEN 12.9352
    WHEN 'Electronic City' THEN 12.839
    ELSE "latitude"
  END,
  "longitude" = CASE "locality"
    WHEN 'Bellandur' THEN 77.6763
    WHEN 'Kadubeesanahalli' THEN 77.6953
    WHEN 'Marathahalli' THEN 77.6974
    WHEN 'Whitefield' THEN 77.7499
    WHEN 'HSR' THEN 77.6389
    WHEN 'Koramangala' THEN 77.6245
    WHEN 'Electronic City' THEN 77.677
    ELSE "longitude"
  END
WHERE "latitude" IS NULL OR "longitude" IS NULL;
