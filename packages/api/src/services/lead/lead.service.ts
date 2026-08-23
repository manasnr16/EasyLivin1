/**
 * LEAD SERVICE
 *
 * The heart of the CRM. Handles:
 * - Lead creation from any source (website, WhatsApp, portal, manual)
 * - Duplicate detection by phone/email
 * - Agent scoping (executives see only their leads)
 * - Stage transitions with audit trail
 * - Lead assignment
 */

import { prisma } from '@easyliving/database';
import type { Prisma } from '@easyliving/database';
import { normalisePhone } from '@easyliving/shared';
import { NotFoundError, ForbiddenError } from '../../middleware/error.middleware.js';
import type { LeadCreateInput, LeadUpdateInput, LeadSearchInput } from '@easyliving/shared';

type UserContext = { id: string; role: string };

const ADMIN_ROLES = ['CLIENT_ADMIN'];

function buildLeadScope(userCtx: UserContext): Prisma.LeadWhereInput {
  if (userCtx.role === 'SALES_EXECUTIVE') {
    return { assignedToId: userCtx.id };
  }
  return {};
}

const leadListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  source: true,
  stage: true,
  status: true,
  budget: true,
  budgetMax: true,
  requirementNote: true,
  createdAt: true,
  updatedAt: true,
  lastContactAt: true,
  property: {
    select: { id: true, title: true, slug: true, village: true },
  },
  assignedTo: {
    select: { id: true, firstName: true, lastName: true, avatarUrl: true },
  },
} satisfies Prisma.LeadSelect;

const leadDetailSelect = {
  ...leadListSelect,
  alternatePhone: true,
  city: true,
  interestedIn: true,
  preferredRegion: true,
  preferredTaluka: true,
  notes: true,
  externalRef: true,
  externalSource: true,
  firstContactAt: true,
  closedAt: true,
  duplicateOfId: true,
  activities: {
    orderBy: { createdAt: 'desc' as const },
    select: {
      id: true, type: true, note: true,
      fromStage: true, toStage: true,
      metadata: true, createdAt: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
    take: 50,
  },
} satisfies Prisma.LeadSelect;

// ── Duplicate detection ───────────────────────────────────────────

async function checkDuplicate(phone: string, email?: string): Promise<string | null> {
  const normalisedPhone = normalisePhone(phone);

  const existing = await prisma.lead.findFirst({
    where: {
      status: { not: 'JUNK' },
      OR: [
        { phone: normalisedPhone },
        ...(email ? [{ email }] : []),
      ],
    },
    select: { id: true },
    orderBy: { createdAt: 'desc' },
  });

  return existing?.id ?? null;
}

// ── Service functions ─────────────────────────────────────────────

export async function createLead(
  input: LeadCreateInput,
  userCtx: UserContext,
  autoAssign = true
) {
  const phone = normalisePhone(input.phone);
  const email = input.email || undefined;

  // Duplicate detection
  const duplicateId = await checkDuplicate(phone, email);

  // Determine assignment
  let assignedToId = input.assignedToId;

  if (!assignedToId && autoAssign) {
    if (input.propertyId) {
      // Assign to the primary agent of the property
      const primaryAgent = await prisma.propertyAgent.findFirst({
        where: { propertyId: input.propertyId, isPrimary: true },
        select: { agentId: true },
      });
      assignedToId = primaryAgent?.agentId;
    }

    // Fallback: assign to the creating user if they're an agent
    if (!assignedToId && userCtx.role === 'SALES_EXECUTIVE') {
      assignedToId = userCtx.id;
    }
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name,
      email,
      phone,
      alternatePhone: input.alternatePhone,
      city: input.city,
      source: input.source ?? 'WEBSITE',
      budget: input.budget,
      budgetMax: input.budgetMax,
      requirementNote: input.requirementNote,
      interestedIn: input.interestedIn,
      preferredRegion: input.preferredRegion,
      preferredTaluka: input.preferredTaluka,
      notes: input.message,
      propertyId: input.propertyId,
      assignedToId,
      createdById: userCtx.id,
      status: duplicateId ? 'DUPLICATE' : 'ACTIVE',
      duplicateOfId: duplicateId,
      firstContactAt: new Date(),
    } as any,
    select: leadDetailSelect,
  });

  // Auto-create first activity
  if (lead.id) {
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: userCtx.id,
        type: 'note',
        note: `Lead created from ${input.source ?? 'website'}${
          duplicateId ? ` (duplicate of lead ${duplicateId})` : ''
        }`,
      },
    });
  }

  return { lead, isDuplicate: !!duplicateId };
}

export async function getLeads(filters: LeadSearchInput, userCtx: UserContext) {
  const { page, limit, stage, source, assignedToId, status, dateFrom, dateTo, q } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.LeadWhereInput = {
    ...buildLeadScope(userCtx),
    ...(stage && { stage: stage as any }),
    ...(source && { source: source as any }),
    ...(status && { status: status as any }),
    ...(assignedToId && ADMIN_ROLES.includes(userCtx.role) && { assignedToId }),
    ...((dateFrom || dateTo) && {
      createdAt: {
        ...(dateFrom && { gte: dateFrom }),
        ...(dateTo && { lte: dateTo }),
      },
    }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
      ],
    }),
  };

  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: leadListSelect,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total, page, limit };
}

export async function getLeadById(id: string, userCtx: UserContext) {
  const lead = await prisma.lead.findUnique({
    where: { id },
    select: leadDetailSelect,
  });

  if (!lead) throw new NotFoundError('Lead');

  if (
    userCtx.role === 'SALES_EXECUTIVE' &&
    lead.assignedTo?.id !== userCtx.id
  ) {
    throw new ForbiddenError('You do not have access to this lead');
  }

  return lead;
}

export async function updateLead(
  id: string,
  input: LeadUpdateInput,
  userCtx: UserContext
) {
  const existing = await getLeadById(id, userCtx);

  // Record stage change in activity log
  if (input.stage && input.stage !== existing.stage) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: userCtx.id,
        type: 'stage_change',
        fromStage: existing.stage as any,
        toStage: input.stage as any,
        note: `Stage changed from ${existing.stage} to ${input.stage}`,
      },
    });
  }

  // Record assignment change
  if (input.assignedToId && input.assignedToId !== existing.assignedTo?.id) {
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: userCtx.id,
        type: 'assignment',
        note: `Lead reassigned`,
      },
    });
  }

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: {
      ...input,
      ...(input.stage === 'CLOSED_WON' || input.stage === 'CLOSED_LOST'
        ? { closedAt: new Date() }
        : {}),
      lastContactAt: new Date(),
    } as any,
    select: leadDetailSelect,
  });

  return updatedLead;
}

export async function addLeadActivity(
  leadId: string,
  type: string,
  note: string,
  userCtx: UserContext
) {
  await getLeadById(leadId, userCtx);

  const activity = await prisma.leadActivity.create({
    data: {
      leadId,
      userId: userCtx.id,
      type,
      note,
    },
    select: {
      id: true, type: true, note: true, createdAt: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  // Update last contact time
  await prisma.lead.update({
    where: { id: leadId },
    data: { lastContactAt: new Date() },
  });

  return activity;
}

// Most recent activity entries across the user's visible leads, for the
// dashboard "Recent Activity" feed.
export async function getRecentActivity(userCtx: UserContext, limit = 8) {
  const scope = buildLeadScope(userCtx);

  const activities = await prisma.leadActivity.findMany({
    where: { lead: scope },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, type: true, note: true, createdAt: true,
      lead: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return activities.map((a) => ({
    id: a.id,
    type: a.type,
    text: a.note ?? `${a.type.replace('_', ' ')} — ${a.lead.name}`,
    createdAt: a.createdAt,
    user: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
  }));
}

// Leads created + won per month, last N months (role-scoped)
export async function getMonthlyLeadTrends(userCtx: UserContext, months = 6) {
  const scope = buildLeadScope(userCtx);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.lead.findMany({
    where: { ...scope, createdAt: { gte: since } },
    select: { createdAt: true, stage: true },
  });

  const buckets = new Map<string, { leads: number; won: number }>();
  for (let i = 0; i < months; i++) {
    const d = new Date(since);
    d.setMonth(d.getMonth() + i);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, { leads: 0, won: 0 });
  }

  for (const row of rows) {
    const key = `${row.createdAt.getFullYear()}-${row.createdAt.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.leads += 1;
    if (row.stage === 'CLOSED_WON') bucket.won += 1;
  }

  return Array.from(buckets.entries()).map(([key, counts]) => {
    const [year, month] = key.split('-').map(Number);
    const label = new Date(year!, month!, 1).toLocaleDateString('en-IN', { month: 'short' });
    return { month: label, ...counts };
  });
}

// Per-agent performance breakdown for the Reports page (admin only — callers
// must enforce that at the route layer).
export async function getAgentPerformance() {
  const agents = await prisma.user.findMany({
    where: { role: 'SALES_EXECUTIVE', status: 'ACTIVE' },
    select: {
      id: true, firstName: true, lastName: true,
      _count: { select: { propertiesOwned: true, leadsAssigned: true } },
    },
  });

  // See the comment on prisma.property.groupBy in property.service.ts —
  // Prisma's groupBy generic spirals into a circular-type error (TS2615)
  // on some TS/Prisma version pairings; erase the receiver to `any` to
  // skip that inference rather than trying to satisfy it.
  const leadAny: any = prisma.lead;
  const wonCounts = await leadAny.groupBy({
    by: ['assignedToId'],
    where: { assignedToId: { not: null }, stage: 'CLOSED_WON' },
    _count: true,
  }) as Array<{ assignedToId: string | null; _count: number }>;
  const wonByAgent = new Map(wonCounts.map((w) => [w.assignedToId, w._count]));

  return agents.map((a) => ({
    id: a.id,
    name: `${a.firstName} ${a.lastName}`,
    properties: a._count.propertiesOwned,
    leads: a._count.leadsAssigned,
    won: wonByAgent.get(a.id) ?? 0,
  }));
}

export async function getLeadStats(userCtx: UserContext) {
  const scope = buildLeadScope(userCtx);
  const leadAny2: any = prisma.lead;

  const [byStage, bySource, total, thisWeek] = await prisma.$transaction([
    leadAny2.groupBy({
      by: ['stage'],
      where: { ...scope, status: 'ACTIVE' },
      orderBy: { stage: 'asc' },
      _count: true,
    }),
    leadAny2.groupBy({
      by: ['source'],
      where: scope,
      orderBy: { source: 'asc' },
      _count: true,
    }),
    prisma.lead.count({ where: scope }),
    prisma.lead.count({
      where: {
        ...scope,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]) as unknown as [
    Array<{ stage: string; _count: number }>,
    Array<{ source: string; _count: number }>,
    number,
    number,
  ];

  return { byStage, bySource, total, thisWeek };
}
