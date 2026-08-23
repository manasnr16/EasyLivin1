/**
 * GOA LOCATION CONSTANTS
 *
 * The full hierarchical location structure for Goa:
 * Region → Taluka → Village/Area
 *
 * Used in: property forms, search filters, agent specialisation, lead routing
 */

export const GOA_LOCATIONS = {
  NORTH_GOA: {
    label: 'North Goa',
    talukas: {
      BARDEZ: {
        label: 'Bardez',
        villages: [
          'Anjuna', 'Arpora', 'Assagao', 'Baga', 'Calangute', 'Candolim',
          'Chapora', 'Mapusa', 'Morjim', 'Nerul', 'Porvorim', 'Siolim',
          'Vagator', 'Aldona', 'Nachinola', 'Oxel', 'Pilerne', 'Saligao',
        ],
      },
      PERNEM: {
        label: 'Pernem',
        villages: [
          'Arambol', 'Ashvem', 'Keri', 'Mandrem', 'Paliem', 'Pernem',
          'Querim', 'Tiracol', 'Agarwada',
        ],
      },
      BICHOLIM: {
        label: 'Bicholim',
        villages: [
          'Bicholim', 'Mayem', 'Pale', 'Sanquelim', 'Sirsaim', 'Lamgao',
        ],
      },
      TISWADI: {
        label: 'Tiswadi',
        villages: [
          'Panaji', 'Taleigao', 'Dona Paula', 'Bambolim', 'Agaçaim',
          'Merces', 'Ribandar', 'Santa Cruz', 'Corlim',
        ],
      },
    },
  },
  SOUTH_GOA: {
    label: 'South Goa',
    talukas: {
      SALCETE: {
        label: 'Salcete',
        villages: [
          'Margao', 'Benaulim', 'Cavelossim', 'Colva', 'Fatrade', 'Navelim',
          'Nuvem', 'Varca', 'Majorda', 'Betalbatim', 'Carmona', 'Cuncolim',
          'Lutolim', 'Orlim', 'Raia',
        ],
      },
      MORMUGAO: {
        label: 'Mormugao',
        villages: [
          'Vasco da Gama', 'Bogmalo', 'Baina', 'Chicolna', 'Dabolim',
          'Headland Sada', 'Mormugao', 'Sancoale',
        ],
      },
      QUEPEM: {
        label: 'Quepem',
        villages: [
          'Quepem', 'Cabo de Rama', 'Cavorem', 'Curchorem',
        ],
      },
      SANGUEM: {
        label: 'Sanguem',
        villages: [
          'Sanguem', 'Cotigao', 'Mollem', 'Rivona',
        ],
      },
      CANACONA: {
        label: 'Canacona',
        villages: [
          'Agonda', 'Chaudi', 'Cola', 'Galgibaga', 'Palolem', 'Patnem',
          'Polem', 'Rajbag',
        ],
      },
      PONDA: {
        label: 'Ponda',
        villages: [
          'Ponda', 'Bandora', 'Bethoda', 'Borim', 'Curti', 'Kavlem',
          'Khandepar', 'Marcela', 'Priol', 'Tisk',
        ],
      },
    },
  },
} as const;

export type RegionKey = keyof typeof GOA_LOCATIONS;
export type NorthGoaTalukaKey = keyof typeof GOA_LOCATIONS.NORTH_GOA.talukas;
export type SouthGoaTalukaKey = keyof typeof GOA_LOCATIONS.SOUTH_GOA.talukas;
export type TalukaKey = NorthGoaTalukaKey | SouthGoaTalukaKey;

/** Flat list of all talukas for dropdowns */
export const ALL_TALUKAS = [
  ...Object.entries(GOA_LOCATIONS.NORTH_GOA.talukas).map(([key, val]) => ({
    key: key as NorthGoaTalukaKey,
    label: val.label,
    region: 'NORTH_GOA' as const,
  })),
  ...Object.entries(GOA_LOCATIONS.SOUTH_GOA.talukas).map(([key, val]) => ({
    key: key as SouthGoaTalukaKey,
    label: val.label,
    region: 'SOUTH_GOA' as const,
  })),
];

/** Get all villages for a given taluka */
export function getVillagesForTaluka(talukaKey: TalukaKey): readonly string[] {
  const northTaluka = GOA_LOCATIONS.NORTH_GOA.talukas[talukaKey as NorthGoaTalukaKey];
  if (northTaluka) return northTaluka.villages;
  const southTaluka = GOA_LOCATIONS.SOUTH_GOA.talukas[talukaKey as SouthGoaTalukaKey];
  if (southTaluka) return southTaluka.villages;
  return [];
}

// ── Property Constants ────────────────────────────────────────────

export const PROPERTY_TYPES = [
  { value: 'APARTMENTS_PENTHOUSES', label: 'Apartments & Penthouses' },
  { value: 'BUNGALOWS_VILLAS', label: 'Bungalows & Villas' },
  { value: 'PORTUGUESE_GOAN_HOUSE', label: 'Portuguese Houses / Goan House' },
  { value: 'PLOTS', label: 'Plots' },
  { value: 'BEACH_RIVERSIDE_PROPERTIES', label: 'Beach / River Side Properties' },
  { value: 'APPROVED_PROJECTS', label: 'Approved Projects' },
  { value: 'RESORT_AND_PLOTS_FOR_RESORTS', label: 'Resort and Plots for Resorts' },
  { value: 'OFFICE', label: 'Office' },
  { value: 'SHOP_SHOWROOMS', label: 'Shop & Showrooms' },
  { value: 'INDUSTRIAL_SHEDS_PLOTS_GODOWN', label: 'Industrial Sheds / Plots & Godown' },
  { value: 'AGRICULTURE_FARM_ORCHARD_LAND', label: 'Agriculture / Farm / Orchard Land' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'ROW_HOUSE_DUPLEX', label: 'Row House & Duplex' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'RESORT_FOR_LEASE_RENT', label: 'Resort for Lease / Rent' },
  { value: 'BEAUTY_PARLOUR', label: 'Beauty Parlour' },
  { value: 'BOUTIQUE_RESORT', label: 'Boutique Resort' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'TREE_HOUSE_STAFF_QUARTERS', label: 'Tree House and Staff Quarters' },
] as const;

export type PropertyTypeValue = (typeof PROPERTY_TYPES)[number]['value'];

/**
 * SPEC FIELD APPLICABILITY BY PROPERTY TYPE
 *
 * Not every "Property Specification" field makes sense for every property
 * type — raw land has no bedrooms, a shop has no plot area. Rather than
 * hardcoding conditionals inline wherever these fields are rendered or
 * validated, every consumer (CRM Add/Edit Property form, website filters,
 * CSV import, API validation) reads from this single map.
 *
 * Grouped by category (mirrors how MagicBricks/99acres/Housing.com scope
 * their field sets per property type):
 *  - Residential (built, no separate plot)
 *  - Residential (built + plot)
 *  - Land only
 *  - Commercial (built)
 *  - Commercial (land-heavy)
 *  - Hospitality
 *  - Ambiguous/mixed-use — shows the full field set rather than risk hiding
 *    a field an agent actually needs (Approved Projects, Beach/Riverside)
 */
export type SpecField =
  | 'bedrooms'
  | 'bathrooms'
  | 'areaSqFt'
  | 'plotAreaSqFt'
  | 'furnishing'
  | 'parking'
  | 'possessionStatus'
  | 'reraNumber';

const ALL_SPEC_FIELDS: SpecField[] = [
  'bedrooms', 'bathrooms', 'areaSqFt', 'plotAreaSqFt',
  'furnishing', 'parking', 'possessionStatus', 'reraNumber',
];

const RESIDENTIAL_BUILT: SpecField[] = [
  'bedrooms', 'bathrooms', 'areaSqFt', 'furnishing', 'parking', 'possessionStatus', 'reraNumber',
];

const RESIDENTIAL_WITH_PLOT: SpecField[] = [...RESIDENTIAL_BUILT, 'plotAreaSqFt'];

const LAND_ONLY: SpecField[] = ['plotAreaSqFt', 'possessionStatus', 'reraNumber'];

const COMMERCIAL_BUILT: SpecField[] = [
  'bathrooms', 'areaSqFt', 'furnishing', 'parking', 'possessionStatus', 'reraNumber',
];

const COMMERCIAL_LAND_HEAVY: SpecField[] = [
  'areaSqFt', 'plotAreaSqFt', 'parking', 'possessionStatus', 'reraNumber',
];

const HOSPITALITY: SpecField[] = [
  'bedrooms', 'bathrooms', 'areaSqFt', 'furnishing', 'parking', 'possessionStatus', 'reraNumber',
];

export const FIELD_CONFIG: Record<PropertyTypeValue, SpecField[]> = {
  // Residential (built, no separate plot)
  APARTMENTS_PENTHOUSES: RESIDENTIAL_BUILT,

  // Residential (built + plot)
  BUNGALOWS_VILLAS: RESIDENTIAL_WITH_PLOT,
  PORTUGUESE_GOAN_HOUSE: RESIDENTIAL_WITH_PLOT,
  VILLA: RESIDENTIAL_WITH_PLOT,
  ROW_HOUSE_DUPLEX: RESIDENTIAL_WITH_PLOT,
  // Near-universally a standalone structure on its own parcel in Goa
  // listings (not a unit in a building), so Plot Area is realistic data
  // an agent would have — grouped with the "+ plot" residential set.
  TREE_HOUSE_STAFF_QUARTERS: RESIDENTIAL_WITH_PLOT,

  // Land only
  PLOTS: LAND_ONLY,
  AGRICULTURE_FARM_ORCHARD_LAND: LAND_ONLY,
  RESORT_AND_PLOTS_FOR_RESORTS: LAND_ONLY,

  // Commercial (built)
  OFFICE: COMMERCIAL_BUILT,
  SHOP_SHOWROOMS: COMMERCIAL_BUILT,
  RESTAURANT: COMMERCIAL_BUILT,
  BEAUTY_PARLOUR: COMMERCIAL_BUILT,

  // Commercial (land-heavy)
  INDUSTRIAL_SHEDS_PLOTS_GODOWN: COMMERCIAL_LAND_HEAVY,

  // Hospitality
  HOTEL: HOSPITALITY,
  BOUTIQUE_RESORT: HOSPITALITY,
  RESORT_FOR_LEASE_RENT: HOSPITALITY,

  // Ambiguous / mixed-use — show everything rather than hide a field an
  // agent might need and have no way to enter that data.
  APPROVED_PROJECTS: ALL_SPEC_FIELDS,
  BEACH_RIVERSIDE_PROPERTIES: ALL_SPEC_FIELDS,
};

/** The spec fields applicable to a given property type. Falls back to the
 * full field set for an unrecognised/legacy type value rather than hiding
 * fields that might hold real data. */
export function getFieldsForPropertyType(type: string): SpecField[] {
  return FIELD_CONFIG[type as PropertyTypeValue] ?? ALL_SPEC_FIELDS;
}

/** Whether a given spec field should be shown/validated for a property type. */
export function isFieldApplicable(type: string, field: SpecField): boolean {
  return getFieldsForPropertyType(type).includes(field);
}

/** Land-only categories where Plot Area is the primary "size" field and
 * should be required rather than optional (mirrors LAND_ONLY above). */
export const LAND_ONLY_PROPERTY_TYPES: PropertyTypeValue[] = [
  'PLOTS', 'AGRICULTURE_FARM_ORCHARD_LAND', 'RESORT_AND_PLOTS_FOR_RESORTS',
];

export const LISTING_TYPES = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
  { value: 'SALE_AND_RENT', label: 'Sale & Rent' },
] as const;

export const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Unfurnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'fully-furnished', label: 'Fully Furnished' },
] as const;

export const POSSESSION_OPTIONS = [
  { value: 'ready', label: 'Ready to Move' },
  { value: 'under-construction', label: 'Under Construction' },
] as const;

export const FACING_OPTIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north-east', label: 'North East' },
  { value: 'north-west', label: 'North West' },
  { value: 'south-east', label: 'South East' },
  { value: 'south-west', label: 'South West' },
] as const;

export const COMMON_AMENITIES = [
  'Swimming Pool', 'Private Pool', 'Garden', 'Terrace',
  'Lift / Elevator', 'Generator Backup', 'Solar Power',
  '24/7 Security', 'CCTV Surveillance', 'Intercom',
  'Covered Parking', 'Open Parking', 'Visitor Parking',
  'Modular Kitchen', 'Gym / Fitness Centre', 'Clubhouse',
  'Children Play Area', 'Jogging Track', 'Badminton Court',
  'Water Treatment Plant', 'Rainwater Harvesting',
  'Wi-Fi Ready', 'Gated Community', 'Maintenance Staff',
  'Corner Plot', 'Main Road Frontage', 'Sea View', 'Garden View',
  'Water Connection', 'Electricity', 'RERA Registered',
] as const;

// ── Lead Constants ────────────────────────────────────────────────

export const LEAD_SOURCES = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'MAGICBRICKS', label: 'MagicBricks' },
  { value: 'ACRES_99', label: '99acres' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'WALK_IN', label: 'Walk-In' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const LEAD_STAGES = [
  { value: 'NEW', label: 'New', color: 'blue' },
  { value: 'CONTACTED', label: 'Contacted', color: 'indigo' },
  { value: 'SITE_VISIT_SCHEDULED', label: 'Site Visit Scheduled', color: 'violet' },
  { value: 'SITE_VISIT_DONE', label: 'Site Visit Done', color: 'purple' },
  { value: 'NEGOTIATION', label: 'Negotiation', color: 'amber' },
  { value: 'CLOSED_WON', label: 'Closed – Won', color: 'green' },
  { value: 'CLOSED_LOST', label: 'Closed – Lost', color: 'red' },
] as const;

// ── Pagination ────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
export const UPLOAD_MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_UPLOAD_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
] as const;

// ── Price ranges for search ───────────────────────────────────────

export const PRICE_RANGES_SALE = [
  { label: 'Under ₹20 Lakhs', min: 0, max: 2000000 },
  { label: '₹20L – ₹50L', min: 2000000, max: 5000000 },
  { label: '₹50L – ₹1 Cr', min: 5000000, max: 10000000 },
  { label: '₹1 Cr – ₹2 Cr', min: 10000000, max: 20000000 },
  { label: '₹2 Cr – ₹5 Cr', min: 20000000, max: 50000000 },
  { label: 'Above ₹5 Cr', min: 50000000, max: null },
] as const;

export const PRICE_RANGES_RENT = [
  { label: 'Under ₹10,000/mo', min: 0, max: 10000 },
  { label: '₹10K – ₹25K/mo', min: 10000, max: 25000 },
  { label: '₹25K – ₹50K/mo', min: 25000, max: 50000 },
  { label: '₹50K – ₹1L/mo', min: 50000, max: 100000 },
  { label: 'Above ₹1L/mo', min: 100000, max: null },
] as const;
