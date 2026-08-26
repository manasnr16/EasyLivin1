export type UserRole = 'CLIENT_ADMIN' | 'SALES_EXECUTIVE' | 'MARKETING_MANAGER'

export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  role: UserRole
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  avatarUrl?: string
  locationTags?: string[]
  lastLoginAt?: string
  createdAt: string
  _count?: { propertiesOwned: number; leadsAssigned: number }
}

export type PropertyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'UNDER_NEGOTIATION' | 'ARCHIVED' | 'SOLD' | 'RENTED'
export type ListingType = 'SALE' | 'RENT' | 'SALE_AND_RENT'
export type PropertyType =
  | 'APARTMENTS_PENTHOUSES' | 'BUNGALOWS_VILLAS' | 'PORTUGUESE_GOAN_HOUSE' | 'PLOTS'
  | 'BEACH_RIVERSIDE_PROPERTIES' | 'APPROVED_PROJECTS' | 'RESORT_AND_PLOTS_FOR_RESORTS'
  | 'OFFICE' | 'SHOP_SHOWROOMS' | 'INDUSTRIAL_SHEDS_PLOTS_GODOWN' | 'AGRICULTURE_FARM_ORCHARD_LAND'
  | 'ROW_HOUSE_DUPLEX' | 'RESTAURANT' | 'RESORT_FOR_LEASE_RENT' | 'BEAUTY_PARLOUR'
  | 'BOUTIQUE_RESORT' | 'HOTEL'

export interface Property {
  id: string
  title: string
  slug: string
  propertyType: PropertyType
  listingType: ListingType
  status: PropertyStatus
  region: 'NORTH_GOA' | 'SOUTH_GOA'
  taluka: string
  village: string
  salePrice?: number
  rentPrice?: number
  bedrooms?: number
  bathrooms?: number
  areaSqFt?: number
  isFeatured: boolean
  coverImage?: string
  agent: { id: string; firstName: string; lastName: string }
  viewCount: number
  createdAt: string
  updatedAt: string
}

export type LeadStage = 'NEW' | 'CONTACTED' | 'SITE_VISIT_SCHEDULED' | 'SITE_VISIT_DONE' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST'
export type LeadSource = 'WEBSITE' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'MAGICBRICKS' | 'ACRES_99' | 'REFERRAL' | 'WALK_IN' | 'OTHER'

export interface Lead {
  id: string
  name: string
  email?: string
  phone: string
  source: LeadSource
  stage: LeadStage
  status: 'ACTIVE' | 'DUPLICATE' | 'JUNK'
  budget?: number
  requirementNote?: string
  propertyTitle?: string
  propertyId?: string
  assignedTo?: { id: string; firstName: string; lastName: string }
  lastContactAt?: string
  createdAt: string
  activities?: LeadActivity[]
}

export interface LeadActivity {
  id: string
  type: string
  note: string | null
  fromStage?: LeadStage | null
  toStage?: LeadStage | null
  createdAt: string
  user: { firstName: string; lastName: string } | null
}

export interface UploadBatch {
  id: string
  fileName: string
  totalRows: number
  successRows: number
  failedRows: number
  status: 'PROCESSING' | 'DONE' | 'FAILED'
  createdAt: string
  completedAt?: string
  uploadedBy: { firstName: string; lastName: string }
}

export interface DashboardStats {
  totalProperties: number
  pendingApproval: number
  totalLeads: number
  newLeadsThisWeek: number
  leadsByStage: { stage: LeadStage; count: number }[]
  leadsBySource: { source: string; count: number }[]
  recentLeads: Lead[]
  recentActivity: { text: string; time: string; type: string }[]
}
