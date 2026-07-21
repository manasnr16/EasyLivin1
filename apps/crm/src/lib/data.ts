import type { Property, Lead, User, UploadBatch, DashboardStats } from '@/types'

export const MOCK_AGENTS: User[] = [
  { id: 'agent-001', email: 'rahul@easylivingoa.com', firstName: 'Rahul', lastName: 'Fernandes', role: 'SALES_EXECUTIVE', status: 'ACTIVE', locationTags: ['BARDEZ', 'PERNEM'], createdAt: '2024-02-01T00:00:00Z' },
  { id: 'agent-002', email: 'priya@easylivingoa.com', firstName: 'Priya', lastName: 'Naik', role: 'SALES_EXECUTIVE', status: 'ACTIVE', locationTags: ['SALCETE', 'MORMUGAO'], createdAt: '2024-02-15T00:00:00Z' },
  { id: 'agent-003', email: 'carlos@easylivingoa.com', firstName: 'Carlos', lastName: 'D\'Souza', role: 'SALES_EXECUTIVE', status: 'ACTIVE', locationTags: ['TISWADI'], createdAt: '2024-03-01T00:00:00Z' },
]

export const MOCK_PROPERTIES: Property[] = [
  { id: 'prop-001', title: '3 BHK Luxury Villa in Vagator', slug: 'luxury-villa-vagator', propertyType: 'VILLA', listingType: 'SALE', status: 'PUBLISHED', region: 'NORTH_GOA', taluka: 'BARDEZ', village: 'Vagator', salePrice: 4200000, bedrooms: 3, bathrooms: 3, areaSqFt: 2200, isFeatured: true, coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=60', agent: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, viewCount: 124, createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'prop-002', title: '2 BHK Apartment in Porvorim', slug: '2bhk-apartment-porvorim', propertyType: 'APARTMENT', listingType: 'SALE_AND_RENT', status: 'PUBLISHED', region: 'NORTH_GOA', taluka: 'BARDEZ', village: 'Porvorim', salePrice: 6500000, rentPrice: 22000, bedrooms: 2, bathrooms: 2, areaSqFt: 1100, isFeatured: false, coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=60', agent: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, viewCount: 87, createdAt: '2025-01-20T10:00:00Z', updatedAt: '2025-01-22T10:00:00Z' },
  { id: 'prop-003', title: 'Commercial Plot in Margao', slug: 'commercial-plot-margao', propertyType: 'PLOT', listingType: 'SALE', status: 'PENDING_APPROVAL', region: 'SOUTH_GOA', taluka: 'SALCETE', village: 'Margao', salePrice: 8500000, isFeatured: false, agent: { id: 'agent-002', firstName: 'Priya', lastName: 'Naik' }, viewCount: 42, createdAt: '2025-01-25T10:00:00Z', updatedAt: '2025-01-25T10:00:00Z' },
  { id: 'prop-004', title: 'Portuguese Heritage Home in Assagao', slug: 'portuguese-home-assagao', propertyType: 'VILLA', listingType: 'SALE', status: 'PUBLISHED', region: 'NORTH_GOA', taluka: 'BARDEZ', village: 'Assagao', salePrice: 3200000, bedrooms: 3, bathrooms: 2, areaSqFt: 2600, isFeatured: true, coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=60', agent: { id: 'agent-003', firstName: 'Carlos', lastName: "D'Souza" }, viewCount: 203, createdAt: '2025-01-10T10:00:00Z', updatedAt: '2025-01-28T10:00:00Z' },
  { id: 'prop-005', title: 'Beach Facing Villa in Candolim', slug: 'beach-villa-candolim', propertyType: 'VILLA', listingType: 'SALE', status: 'DRAFT', region: 'NORTH_GOA', taluka: 'BARDEZ', village: 'Candolim', salePrice: 9800000, bedrooms: 4, bathrooms: 4, areaSqFt: 4200, isFeatured: false, coverImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=60', agent: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, viewCount: 0, createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-02-01T10:00:00Z' },
  { id: 'prop-006', title: '1 BHK Apartment for Rent in Panjim', slug: '1bhk-rent-panjim', propertyType: 'APARTMENT', listingType: 'RENT', status: 'PUBLISHED', region: 'NORTH_GOA', taluka: 'TISWADI', village: 'Panjim', rentPrice: 18000, bedrooms: 1, bathrooms: 1, areaSqFt: 650, isFeatured: false, agent: { id: 'agent-003', firstName: 'Carlos', lastName: "D'Souza" }, viewCount: 56, createdAt: '2025-01-30T10:00:00Z', updatedAt: '2025-01-30T10:00:00Z' },
]

export const MOCK_LEADS: Lead[] = [
  { id: 'lead-001', name: 'Arjun Mehta', email: 'arjun@gmail.com', phone: '+919988776655', source: 'WEBSITE', stage: 'CONTACTED', status: 'ACTIVE', budget: 5000000, requirementNote: 'Looking for 2-3 BHK in North Goa near beach', propertyTitle: '2 BHK Apartment in Porvorim', propertyId: 'prop-002', assignedTo: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, lastContactAt: '2025-02-10T14:00:00Z', createdAt: '2025-02-08T10:00:00Z' },
  { id: 'lead-002', name: 'Sunita Krishnamurthy', email: 'sunita@email.com', phone: '+971501234567', source: 'REFERRAL', stage: 'SITE_VISIT_SCHEDULED', status: 'ACTIVE', budget: 8000000, requirementNote: 'NRI buyer, wants villa with pool, North Goa', propertyTitle: '3 BHK Luxury Villa in Vagator', propertyId: 'prop-001', assignedTo: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, lastContactAt: '2025-02-11T09:00:00Z', createdAt: '2025-02-05T10:00:00Z' },
  { id: 'lead-003', name: 'Mario Fernandes', phone: '+919823000111', source: 'WHATSAPP', stage: 'NEW', status: 'ACTIVE', budget: 3500000, requirementNote: 'Interested in plots in South Goa', assignedTo: { id: 'agent-002', firstName: 'Priya', lastName: 'Naik' }, createdAt: '2025-02-12T08:00:00Z' },
  { id: 'lead-004', name: 'Deepika Rajan', email: 'deepika@corp.com', phone: '+919900112233', source: 'FACEBOOK', stage: 'NEGOTIATION', status: 'ACTIVE', budget: 12000000, requirementNote: 'Looking for commercial property in Panjim', assignedTo: { id: 'agent-003', firstName: 'Carlos', lastName: "D'Souza" }, lastContactAt: '2025-02-09T16:30:00Z', createdAt: '2025-01-28T10:00:00Z' },
  { id: 'lead-005', name: 'Rahul Sharma', email: 'rahulsharma@email.com', phone: '+919711234567', source: 'MAGICBRICKS', stage: 'SITE_VISIT_DONE', status: 'ACTIVE', budget: 6500000, propertyTitle: 'Portuguese Heritage Home in Assagao', propertyId: 'prop-004', assignedTo: { id: 'agent-003', firstName: 'Carlos', lastName: "D'Souza" }, lastContactAt: '2025-02-11T11:00:00Z', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'lead-006', name: 'Kavya Nambiar', phone: '+919845678901', source: 'WEBSITE', stage: 'CLOSED_WON', status: 'ACTIVE', budget: 2200000, propertyTitle: '1 BHK Apartment for Rent in Panjim', propertyId: 'prop-006', assignedTo: { id: 'agent-003', firstName: 'Carlos', lastName: "D'Souza" }, createdAt: '2025-01-20T10:00:00Z' },
  { id: 'lead-007', name: 'Vikram Patel', email: 'vikram@biz.com', phone: '+919600001122', source: 'INSTAGRAM', stage: 'NEW', status: 'ACTIVE', budget: 4000000, requirementNote: 'Investment property, high ROI focus', assignedTo: { id: 'agent-001', firstName: 'Rahul', lastName: 'Fernandes' }, createdAt: '2025-02-13T07:00:00Z' },
  { id: 'lead-008', name: 'Ananya Bose', phone: '+919333445566', source: 'WALK_IN', stage: 'CONTACTED', status: 'ACTIVE', budget: 7500000, requirementNote: 'Villa for personal use, prefers Assagao area', assignedTo: { id: 'agent-002', firstName: 'Priya', lastName: 'Naik' }, lastContactAt: '2025-02-10T13:00:00Z', createdAt: '2025-02-09T10:00:00Z' },
]

export const MOCK_BATCHES: UploadBatch[] = [
  { id: 'batch-001', fileName: 'north_goa_jan_2025.xlsx', totalRows: 24, successRows: 22, failedRows: 2, status: 'DONE', createdAt: '2025-01-15T09:00:00Z', completedAt: '2025-01-15T09:01:30Z', uploadedBy: { firstName: 'Urmilla', lastName: 'Dias' } },
  { id: 'batch-002', fileName: 'south_goa_properties.csv', totalRows: 12, successRows: 12, failedRows: 0, status: 'DONE', createdAt: '2025-01-28T14:00:00Z', completedAt: '2025-01-28T14:00:45Z', uploadedBy: { firstName: 'Urmilla', lastName: 'Dias' } },
  { id: 'batch-003', fileName: 'feb_batch_test.xlsx', totalRows: 8, successRows: 5, failedRows: 3, status: 'DONE', createdAt: '2025-02-05T11:00:00Z', completedAt: '2025-02-05T11:00:30Z', uploadedBy: { firstName: 'Urmilla', lastName: 'Dias' } },
]

export const MOCK_DASHBOARD: DashboardStats = {
  totalProperties: 6,
  pendingApproval: 1,
  totalLeads: 8,
  newLeadsThisWeek: 3,
  leadsByStage: [
    { stage: 'NEW', count: 2 },
    { stage: 'CONTACTED', count: 2 },
    { stage: 'SITE_VISIT_SCHEDULED', count: 1 },
    { stage: 'SITE_VISIT_DONE', count: 1 },
    { stage: 'NEGOTIATION', count: 1 },
    { stage: 'CLOSED_WON', count: 1 },
    { stage: 'CLOSED_LOST', count: 0 },
  ],
  leadsBySource: [
    { source: 'Website', count: 3 },
    { source: 'WhatsApp', count: 1 },
    { source: 'Facebook', count: 1 },
    { source: 'MagicBricks', count: 1 },
    { source: 'Referral', count: 1 },
    { source: 'Walk-In', count: 1 },
  ],
  recentLeads: MOCK_LEADS.slice(0, 5),
  recentActivity: [
    { text: 'Sunita Krishnamurthy — site visit scheduled for Vagator Villa', time: '2h ago', type: 'visit' },
    { text: 'New enquiry from Vikram Patel via website', time: '4h ago', type: 'lead' },
    { text: 'Kavya Nambiar deal closed — 1BHK Panjim rental', time: '1d ago', type: 'won' },
    { text: 'Property uploaded: Beach Facing Villa in Candolim (draft)', time: '2d ago', type: 'property' },
    { text: 'Batch upload: feb_batch_test.xlsx — 5 of 8 rows imported', time: '3d ago', type: 'upload' },
  ],
}

// Helpers
export function getPropertiesForUser(userId: string, isAdmin: boolean): Property[] {
  if (isAdmin) return MOCK_PROPERTIES
  return MOCK_PROPERTIES.filter((p) => p.agent.id === userId)
}

export function getLeadsForUser(userId: string, isAdmin: boolean): Lead[] {
  if (isAdmin) return MOCK_LEADS
  return MOCK_LEADS.filter((l) => l.assignedTo?.id === userId)
}

export function formatPrice(amount?: number): string {
  if (!amount) return '—'
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getInitials(first: string, last: string): string {
  return `${first[0]}${last[0]}`.toUpperCase()
}

export const STAGE_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  SITE_VISIT_SCHEDULED: 'Site Visit Sched.',
  SITE_VISIT_DONE: 'Site Visit Done',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed – Won',
  CLOSED_LOST: 'Closed – Lost',
}

export const STAGE_BADGE: Record<string, string> = {
  NEW: 'badge-new',
  CONTACTED: 'badge-contacted',
  SITE_VISIT_SCHEDULED: 'badge-visit',
  SITE_VISIT_DONE: 'badge-visit',
  NEGOTIATION: 'badge-nego',
  CLOSED_WON: 'badge-won',
  CLOSED_LOST: 'badge-lost',
}

export const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'badge-draft',
  PENDING_APPROVAL: 'badge-pending',
  PUBLISHED: 'badge-published',
  ARCHIVED: 'badge-archived',
  SOLD: 'badge-won',
  RENTED: 'badge-won',
}

export const SOURCE_COLOURS: Record<string, string> = {
  Website: '#b59762', WhatsApp: '#22c55e', Facebook: '#3b82f6',
  Instagram: '#ec4899', MagicBricks: '#f97316', Referral: '#8b5cf6',
  'Walk-In': '#64748b', Other: '#94a3b8',
}

export const TALUKAS = [
  'BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI',
  'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA',
]

export const VILLAGES: Record<string, string[]> = {
  BARDEZ: ['Anjuna', 'Arpora', 'Assagao', 'Baga', 'Calangute', 'Candolim', 'Chapora', 'Mapusa', 'Morjim', 'Nerul', 'Porvorim', 'Siolim', 'Vagator'],
  PERNEM: ['Arambol', 'Ashvem', 'Mandrem', 'Pernem', 'Querim'],
  TISWADI: ['Panjim', 'Dona Paula', 'Bambolim', 'Taleigao'],
  SALCETE: ['Margao', 'Benaulim', 'Cavelossim', 'Colva', 'Majorda', 'Varca'],
  MORMUGAO: ['Vasco da Gama', 'Bogmalo', 'Dabolim'],
  BICHOLIM: ['Bicholim', 'Sanquelim'],
  QUEPEM: ['Quepem', 'Curchorem'],
  SANGUEM: ['Sanguem', 'Mollem'],
  CANACONA: ['Agonda', 'Palolem', 'Patnem', 'Chaudi'],
  PONDA: ['Ponda', 'Priol', 'Bandora'],
}
