export interface PropertyFeatures {
  facilitiesAndConvenience?: string[]
  interiorFeatures?: string[]
  technologyAndEfficiency?: string[]
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
}

export interface NavLink {
  label: string
  href: string
}
