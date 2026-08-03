-- Replace the PropertyType enum's 6 generic values with the full 19-item
-- taxonomy used by the CRM's Add Property form. Postgres can't drop/rename
-- enum values that are in use, so we create a new type, cast existing rows
-- across via an explicit mapping, then swap the type in.

BEGIN;

CREATE TYPE "PropertyType_new" AS ENUM (
  'APARTMENTS_PENTHOUSES',
  'BUNGALOWS_VILLAS',
  'PORTUGUESE_GOAN_HOUSE',
  'PLOTS',
  'BEACH_RIVERSIDE_PROPERTIES',
  'APPROVED_PROJECTS',
  'RESORT_AND_PLOTS_FOR_RESORTS',
  'OFFICE',
  'SHOP_SHOWROOMS',
  'INDUSTRIAL_SHEDS_PLOTS_GODOWN',
  'AGRICULTURE_FARM_ORCHARD_LAND',
  'VILLA',
  'ROW_HOUSE_DUPLEX',
  'RESTAURANT',
  'RESORT_FOR_LEASE_RENT',
  'BEAUTY_PARLOUR',
  'BOUTIQUE_RESORT',
  'HOTEL',
  'TREE_HOUSE_STAFF_QUARTERS'
);

-- properties.property_type (NOT NULL)
ALTER TABLE "properties" ALTER COLUMN "property_type" TYPE "PropertyType_new" USING (
  CASE "property_type"::text
    WHEN 'VILLA'      THEN 'VILLA'
    WHEN 'APARTMENT'  THEN 'APARTMENTS_PENTHOUSES'
    WHEN 'PLOT'       THEN 'PLOTS'
    WHEN 'BUNGALOW'   THEN 'BUNGALOWS_VILLAS'
    WHEN 'COMMERCIAL' THEN 'OFFICE'
    WHEN 'FARMHOUSE'  THEN 'AGRICULTURE_FARM_ORCHARD_LAND'
  END
)::"PropertyType_new";

-- leads.interested_in (nullable)
ALTER TABLE "leads" ALTER COLUMN "interested_in" TYPE "PropertyType_new" USING (
  CASE "interested_in"::text
    WHEN 'VILLA'      THEN 'VILLA'
    WHEN 'APARTMENT'  THEN 'APARTMENTS_PENTHOUSES'
    WHEN 'PLOT'       THEN 'PLOTS'
    WHEN 'BUNGALOW'   THEN 'BUNGALOWS_VILLAS'
    WHEN 'COMMERCIAL' THEN 'OFFICE'
    WHEN 'FARMHOUSE'  THEN 'AGRICULTURE_FARM_ORCHARD_LAND'
    ELSE NULL
  END
)::"PropertyType_new";

DROP TYPE "PropertyType";
ALTER TYPE "PropertyType_new" RENAME TO "PropertyType";

COMMIT;
