// Formatting/label helpers shared across CRM pages. Mock data has been
// removed — every page fetches from the real API (see lib/api.ts, lib/adapters.ts).

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

// The app only ever surfaces two roles to users: Admin and Agent.
// SUPER_ADMIN has been removed entirely — CLIENT_ADMIN is the only admin role.
export function getRoleLabel(role: string): string {
  if (role === 'CLIENT_ADMIN') return 'Admin'
  if (role === 'SALES_EXECUTIVE') return 'Agent'
  return role
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

export const ALL_STAGES = [
  'NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE',
  'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST',
] as const

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

export const SOURCE_LABELS: Record<string, string> = {
  WEBSITE: 'Website', WHATSAPP: 'WhatsApp', FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram', LINKEDIN: 'LinkedIn', YOUTUBE: 'YouTube',
  MAGICBRICKS: 'MagicBricks', ACRES_99: '99acres', REFERRAL: 'Referral',
  WALK_IN: 'Walk-In', OTHER: 'Other',
}

export const SOURCE_COLOURS: Record<string, string> = {
  WEBSITE: '#b59762', WHATSAPP: '#22c55e', FACEBOOK: '#3b82f6',
  INSTAGRAM: '#ec4899', LINKEDIN: '#0a66c2', YOUTUBE: '#ef4444',
  MAGICBRICKS: '#f97316', ACRES_99: '#14b8a6', REFERRAL: '#8b5cf6',
  WALK_IN: '#64748b', OTHER: '#94a3b8',
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
