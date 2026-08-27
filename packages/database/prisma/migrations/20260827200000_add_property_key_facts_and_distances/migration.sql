-- Adds two flexible JSON columns for supplementary property-detail rows
-- ("Style of Toilets", "Source of Water", etc.) and nearby-distance rows
-- ("Airport: 25 km", ...) that vary per listing and don't warrant a
-- dedicated column each. Additive only — no existing data touched.

ALTER TABLE "properties"
  ADD COLUMN "key_facts" JSONB,
  ADD COLUMN "distances" JSONB;
