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
  { value: 'VILLA', label: 'Villa' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'PLOT', label: 'Plot / Land' },
  { value: 'BUNGALOW', label: 'Bungalow' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'FARMHOUSE', label: 'Farmhouse' },
] as const;

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
