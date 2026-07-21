/**
 * Adapts the API's Prisma-shaped property/lead responses into the CRM's
 * existing UI types (types/index.ts), so the already-built page components
 * don't need to change shape — only their data source changes.
 *
 * Note: Prisma Decimal fields (salePrice, rentPrice, areaSqFt, budget, ...)
 * serialize to JSON as strings, not numbers — every numeric field here is
 * explicitly coerced with Number(...).
 */

import type { Property, Lead, LeadActivity } from '@/types'

type ApiMedia = { url: string; thumbnailUrl?: string | null; altText?: string | null }
type ApiAgentRef = { id: string; firstName: string; lastName: string; phone?: string | null }

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
  bedrooms?: number | null
  bathrooms?: number | null
  areaSqFt?: string | number | null
  isFeatured: boolean
  viewCount: number
  createdAt: string
  media?: ApiMedia[]
  agents?: { isPrimary?: boolean; agent: ApiAgentRef }[]
}

export function adaptProperty(p: ApiProperty): Property {
  const primaryAgent = p.agents?.find((a) => a.isPrimary)?.agent ?? p.agents?.[0]?.agent

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    propertyType: p.propertyType as Property['propertyType'],
    listingType: p.listingType as Property['listingType'],
    status: p.status as Property['status'],
    region: p.region as Property['region'],
    taluka: p.taluka,
    village: p.village,
    salePrice: p.salePrice != null ? Number(p.salePrice) : undefined,
    rentPrice: p.rentPrice != null ? Number(p.rentPrice) : undefined,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    areaSqFt: p.areaSqFt != null ? Number(p.areaSqFt) : undefined,
    isFeatured: p.isFeatured,
    coverImage: p.media?.[0]?.url,
    agent: primaryAgent
      ? { id: primaryAgent.id, firstName: primaryAgent.firstName, lastName: primaryAgent.lastName }
      : { id: '', firstName: 'Unassigned', lastName: '' },
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  }
}

export interface ApiLead {
  id: string
  name: string
  email?: string | null
  phone: string
  source: string
  stage: string
  status: string
  budget?: string | number | null
  requirementNote?: string | null
  createdAt: string
  lastContactAt?: string | null
  property?: { id: string; title: string; slug: string; village: string } | null
  assignedTo?: { id: string; firstName: string; lastName: string } | null
  activities?: {
    id: string
    type: string
    note: string | null
    fromStage?: string | null
    toStage?: string | null
    createdAt: string
    user: { firstName: string; lastName: string } | null
  }[]
}

export function adaptLead(l: ApiLead): Lead {
  return {
    id: l.id,
    name: l.name,
    email: l.email ?? undefined,
    phone: l.phone,
    source: l.source as Lead['source'],
    stage: l.stage as Lead['stage'],
    status: l.status as Lead['status'],
    budget: l.budget != null ? Number(l.budget) : undefined,
    requirementNote: l.requirementNote ?? undefined,
    propertyTitle: l.property?.title,
    propertyId: l.property?.id,
    assignedTo: l.assignedTo ?? undefined,
    lastContactAt: l.lastContactAt ?? undefined,
    createdAt: l.createdAt,
    activities: l.activities?.map(
      (a): LeadActivity => ({
        id: a.id,
        type: a.type,
        note: a.note,
        fromStage: (a.fromStage as Lead['stage']) ?? undefined,
        toStage: (a.toStage as Lead['stage']) ?? undefined,
        createdAt: a.createdAt,
        user: a.user,
      })
    ),
  }
}
