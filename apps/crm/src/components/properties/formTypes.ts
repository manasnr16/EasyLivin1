// Shared types for the Add/Edit Property wizard (PropertyForm + steps/).

import type { TalukaKey } from '@easyliving/shared'

export type RegionKey = 'NORTH_GOA' | 'SOUTH_GOA'

export interface ApiLocation { id: string; village: string; taluka: TalukaKey; region: RegionKey }

export interface ExistingMedia {
  id: string
  url: string
  isCover: boolean
}

export interface ApiPropertyDetail {
  title: string
  propertyType: string
  listingType: string
  region: RegionKey
  taluka: string
  village: string
  address?: string | null
  salePrice?: string | number | null
  rentPrice?: string | number | null
  priceNegotiable: boolean
  priceOnRequest: boolean
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  areaSqFt?: string | number | null
  plotAreaSqFt?: string | number | null
  floorNumber?: number | null
  floors?: number | null
  furnishing?: string | null
  parking?: number | null
  facing?: string | null
  roadWidthFt?: number | null
  landUse?: string | null
  possessionStatus?: string | null
  description?: string | null
  amenities?: string[]
  isFeatured: boolean
  isPremium: boolean
  status: string
  updatedAt?: string
  agents: { isPrimary: boolean; agent: { id: string } }[]
  media: ExistingMedia[]
}

export interface PropertyFormState {
  title: string
  propertyType: string
  listingType: string
  region: RegionKey
  taluka: string
  village: string
  address: string
  salePrice: string
  rentPrice: string
  priceNegotiable: boolean
  priceOnRequest: boolean
  bedrooms: string
  bathrooms: string
  balconies: string
  areaSqFt: string
  plotAreaSqFt: string
  floorNumber: string
  floors: string
  furnishing: string
  parking: string
  facing: string
  roadWidthFt: string
  landUse: string
  possessionStatus: string
  description: string
  amenities: string[]
  isFeatured: boolean
  isPremium: boolean
  assignedAgentId: string
}

export const EMPTY_FORM: PropertyFormState = {
  title: '',
  propertyType: 'BUNGALOWS_VILLAS',
  listingType: 'SALE',
  region: 'NORTH_GOA',
  taluka: 'BARDEZ',
  village: '',
  address: '',
  salePrice: '',
  rentPrice: '',
  priceNegotiable: false,
  priceOnRequest: false,
  bedrooms: '',
  bathrooms: '',
  balconies: '',
  areaSqFt: '',
  plotAreaSqFt: '',
  floorNumber: '',
  floors: '',
  furnishing: '',
  parking: '0',
  facing: '',
  roadWidthFt: '',
  landUse: '',
  possessionStatus: '',
  description: '',
  amenities: [],
  isFeatured: false,
  isPremium: false,
  assignedAgentId: '',
}

export type StepKey = 'basic' | 'details' | 'location' | 'pricing' | 'features' | 'media'

export const STEPS: { key: StepKey; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'details', label: 'Property' },
  { key: 'location', label: 'Location' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'features', label: 'Features' },
  { key: 'media', label: 'Media' },
]

export function clsxInput(hasError: boolean) {
  return `crm-input ${hasError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`
}
