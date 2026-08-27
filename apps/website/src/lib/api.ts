const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export async function fetchPublicProperties(searchParams?: Record<string, string>) {
  const qs = searchParams ? `?${new URLSearchParams(searchParams)}` : ''
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/properties${qs}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data ?? []) as ApiProperty[]
  } catch (err) {
    console.error('fetchPublicProperties failed:', err)
    return []
  }
}

export async function fetchPublicPropertyBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/properties/${slug}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as ApiProperty
  } catch (err) {
    console.error('fetchPublicPropertyBySlug failed:', err)
    return null
  }
}

export async function submitEnquiry(payload: {
  name: string
  phone: string
  email?: string
  message?: string
  propertyId?: string
}) {
  const res = await fetch(`${API_BASE_URL}/api/enquiries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, source: 'WEBSITE' }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    throw new Error(json.error ?? 'Failed to submit enquiry')
  }
  return json
}

// Shape returned by the API's propertyListSelect / propertyDetailSelect (see packages/api)
export interface ApiProperty {
  id: string
  title: string
  slug: string
  propertyType: string
  listingType: string
  status: string
  region: string
  taluka: string
  village: string
  salePrice?: string | number | null
  rentPrice?: string | number | null
  rentPeriod?: string | null
  priceNegotiable: boolean
  priceOnRequest: boolean
  bedrooms?: number | null
  bathrooms?: number | null
  balconies?: number | null
  areaSqFt?: string | number | null
  plotAreaSqFt?: string | number | null
  floorNumber?: number | null
  floors?: number | null
  parking?: number | null
  facing?: string | null
  address?: string | null
  isFeatured: boolean
  isPremium: boolean
  viewCount: number
  createdAt: string
  description?: string | null
  amenities?: string[]
  keyFacts?: { label: string; value: string }[] | null
  distances?: { label: string; value: string }[] | null
  furnishing?: string | null
  possessionStatus?: string | null
  media?: { url: string; thumbnailUrl?: string | null; altText?: string | null }[]
  agents?: { isPrimary?: boolean; agent: { id: string; firstName: string; lastName: string; phone?: string | null } }[]
}
