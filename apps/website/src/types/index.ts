export interface PropertyFeatures {
  facilitiesAndConvenience?: string[]
  interiorFeatures?: string[]
  technologyAndEfficiency?: string[]
}

export interface PropertyDetailRow {
  label: string
  value: string
}

export interface PropertyMediaItem {
  url: string
  altText?: string | null
}

export interface Property {
  id: string
  slug: string
  title: string
  type: string
  badge: string
  badgeColor?: 'gold' | 'navy' | 'green'
  price: string
  priceNote?: string
  /** Raw sale price in lakhs (undefined for rentals/price-on-request) — use this for filtering/sorting, never re-parse `price`. */
  priceValueLakhs?: number
  location: string
  beds: number | null
  baths: number | null
  area: string
  listing: 'sale' | 'rent'
  region: 'north' | 'south'
  sellerType: string
  img: string
  featured?: boolean
  description?: string
  yearBuilt?: number
  garages?: number
  propertyStatus?: string
  features?: PropertyFeatures

  // Detail-page-only fields — optional so existing card/list consumers
  // that build a Property from mock data don't need to supply them.
  gallery?: PropertyMediaItem[]
  balconies?: number | null
  floorNumber?: number | null
  totalFloors?: number | null
  facing?: string | null
  furnishing?: string | null
  possessionStatus?: string | null
  plotArea?: string | null
  parking?: number | null
  address?: string | null
  village?: string
  keyFacts?: PropertyDetailRow[]
  distances?: PropertyDetailRow[]
}

export interface NavLink {
  label: string
  href: string
}
