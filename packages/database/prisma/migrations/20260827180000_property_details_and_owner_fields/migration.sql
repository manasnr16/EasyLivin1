-- Adds the property-detail and owner/seller fields needed for the new
-- multi-step Add/Edit Property wizard (balconies, floor number, land-only
-- fields, and owner contact info). All columns are nullable additions —
-- no existing data is touched or backfilled.

ALTER TABLE "properties"
  ADD COLUMN "balconies" INTEGER,
  ADD COLUMN "floor_number" INTEGER,
  ADD COLUMN "road_width_ft" INTEGER,
  ADD COLUMN "land_use" TEXT,
  ADD COLUMN "seller_type" TEXT,
  ADD COLUMN "owner_name" TEXT,
  ADD COLUMN "owner_phone" TEXT,
  ADD COLUMN "owner_whatsapp" TEXT,
  ADD COLUMN "owner_email" TEXT,
  ADD COLUMN "agency_name" TEXT,
  ADD COLUMN "listing_source" TEXT;
