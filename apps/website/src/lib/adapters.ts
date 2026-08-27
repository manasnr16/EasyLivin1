/**
 * Adapts the API's Prisma-shaped property response into the website's
 * existing UI Property type (types/index.ts) so PropertyCard, the buy/rent
 * filters, and the detail page keep working unchanged — only the data
 * source changes from a hardcoded array to a live API fetch.
 *
 * Note: Prisma Decimal fields (salePrice, rentPrice, areaSqFt) serialize to
 * JSON as strings, not numbers — coerced with Number(...) before formatting.
 */

import { formatPriceINR, formatRentINR, formatArea, PROPERTY_TYPES } from '@easyliving/shared'
import type { ApiProperty } from './api'
import type { Property } from '@/types'

function propertyTypeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value
}

export function adaptProperty(p: ApiProperty): Property {
  const primaryAgent = p.agents?.find((a) => a.isPrimary)?.agent ?? p.agents?.[0]?.agent

  const price = p.priceOnRequest
    ? 'Price on Request'
    : p.salePrice != null
    ? formatPriceINR(Number(p.salePrice))
    : p.rentPrice != null
    ? formatRentINR(Number(p.rentPrice), p.rentPeriod ?? 'monthly').split('/')[0]
    : '—'

  const priceNote = !p.salePrice && p.rentPrice != null ? `/${p.rentPeriod === 'yearly' ? 'year' : 'month'}` : undefined

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    type: propertyTypeLabel(p.propertyType),
    badge: p.isFeatured ? 'Featured' : p.isPremium ? 'Premium' : '',
    badgeColor: p.isFeatured ? 'gold' : p.isPremium ? 'navy' : undefined,
    price,
    priceNote,
    priceValueLakhs: p.salePrice != null ? Number(p.salePrice) / 100_000 : undefined,
    location: `${p.village}, ${p.region === 'NORTH_GOA' ? 'North' : 'South'} Goa`,
    beds: p.bedrooms ?? null,
    baths: p.bathrooms ?? null,
    area: p.areaSqFt != null ? formatArea(Number(p.areaSqFt)) : '—',
    listing: p.listingType === 'RENT' ? 'rent' : 'sale',
    region: p.region === 'NORTH_GOA' ? 'north' : 'south',
    sellerType: primaryAgent ? 'Agent' : 'Easy Livin Goa',
    img: p.media?.[0]?.url ?? '/images/logo1.png',
    featured: p.isFeatured,
    description: p.description ?? undefined,
    propertyStatus: p.listingType === 'RENT' ? 'For Rent' : 'For Sale',
    features: p.amenities?.length ? { facilitiesAndConvenience: p.amenities } : undefined,

    gallery: p.media?.map((m) => ({ url: m.url, altText: m.altText })),
    balconies: p.balconies,
    floorNumber: p.floorNumber,
    totalFloors: p.floors,
    facing: p.facing,
    furnishing: p.furnishing,
    possessionStatus: p.possessionStatus,
    plotArea: p.plotAreaSqFt != null ? formatArea(Number(p.plotAreaSqFt)) : undefined,
    parking: p.parking,
    address: p.address,
    village: p.village,
    keyFacts: p.keyFacts ?? undefined,
    distances: p.distances ?? undefined,
  }
}
