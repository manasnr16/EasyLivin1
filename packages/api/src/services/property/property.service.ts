/**
 * PROPERTY SERVICE
 *
 * All property business logic.
 * CRITICAL: Every query scopes by agent when role = SALES_EXECUTIVE.
 * Admin and Super Admin skip the scope and see everything.
 */

import { prisma } from '@easyliving/database';
import type { Prisma } from '@easyliving/database';
import { slugify, slugifyUnique } from '@easyliving/shared';
import { NotFoundError, ForbiddenError } from '../../middleware/error.middleware.js';
import type { PropertyCreateInput, PropertyUpdateInput, PropertySearchInput } from '@easyliving/shared';

type UserContext = {
  id: string;
  role: string;
};

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Builds the WHERE clause for property queries.
 * Sales Executives can only see properties where they are assigned.
 */
function buildAgentScope(userCtx: UserContext): Prisma.PropertyWhereInput {
  if (userCtx.role === 'SALES_EXECUTIVE') {
    return {
      agents: { some: { agentId: userCtx.id } },
    };
  }
  return {};
}

/**
 * Generates a unique slug from the property title.
 * Retries with a suffix if the plain slug is taken.
 */
async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title);

  const existing = await prisma.property.findUnique({
    where: { slug: base },
    select: { id: true },
  });

  if (!existing) return base;
  return slugifyUnique(title);
}

// Standard select shape for list views (lightweight)
export const propertyListSelect = {
  id: true,
  title: true,
  slug: true,
  propertyType: true,
  listingType: true,
  status: true,
  region: true,
  taluka: true,
  village: true,
  salePrice: true,
  rentPrice: true,
  rentPeriod: true,
  priceOnRequest: true,
  bedrooms: true,
  bathrooms: true,
  areaSqFt: true,
  isFeatured: true,
  isPremium: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  media: {
    where: { isCover: true, mediaType: 'IMAGE' as const },
    select: { url: true, thumbnailUrl: true, altText: true },
    take: 1,
  },
  agents: {
    where: { isPrimary: true },
    select: {
      agent: {
        select: { id: true, firstName: true, lastName: true, phone: true },
      },
    },
    take: 1,
  },
} satisfies Prisma.PropertySelect;

// Full select for detail view
export const propertyDetailSelect = {
  ...propertyListSelect,
  description: true,
  address: true,
  landmark: true,
  latitude: true,
  longitude: true,
  googleMapsUrl: true,
  pincode: true,
  plotAreaSqFt: true,
  floors: true,
  furnishing: true,
  parking: true,
  facing: true,
  reraNumber: true,
  reraExpiry: true,
  possessionStatus: true,
  possessionDate: true,
  amenities: true,
  isExclusive: true,
  priceNegotiable: true,
  metaTitle: true,
  metaDescription: true,
  approvedAt: true,
  media: {
    orderBy: { sortOrder: 'asc' as const },
    select: {
      id: true, url: true, thumbnailUrl: true,
      altText: true, caption: true, mediaType: true,
      isCover: true, sortOrder: true,
    },
  },
  agents: {
    select: {
      isPrimary: true,
      agent: {
        select: {
          id: true, firstName: true, lastName: true,
          phone: true, email: true, avatarUrl: true,
        },
      },
    },
  },
  createdBy: {
    select: { id: true, firstName: true, lastName: true },
  },
} satisfies Prisma.PropertySelect;

// ── Service functions ─────────────────────────────────────────────

export async function createProperty(
  input: PropertyCreateInput,
  userCtx: UserContext
) {
  const slug = await generateUniqueSlug(input.title);
  const { assignedAgentIds, primaryAgentId, ...propertyData } = input;

  // Determine which agents to assign
  const agentsToAssign = assignedAgentIds?.length
    ? assignedAgentIds
    : [userCtx.id]; // Default: assign to creating user

  const primaryAgent = primaryAgentId ?? agentsToAssign[0];

  const property = await prisma.property.create({
    data: {
      ...propertyData,
      slug,
      createdById: userCtx.id,
      // Both agents and admins publish immediately — no manual approval gate.
      status: 'PUBLISHED',
      publishedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: userCtx.id,
      agents: {
        create: agentsToAssign.map((agentId) => ({
          agentId,
          isPrimary: agentId === primaryAgent,
        })),
      },
    },
    select: propertyDetailSelect,
  });

  return property;
}

export async function getProperties(
  filters: PropertySearchInput,
  userCtx: UserContext
) {
  const { page, limit, sort, q, listingType, propertyType, region, taluka, village,
          minPrice, maxPrice, bedrooms, minArea, maxArea, isFeatured } = filters;

  const skip = (page - 1) * limit;

  // Build the full WHERE clause
  const where: Prisma.PropertyWhereInput = {
    ...buildAgentScope(userCtx),
    // Non-admins browsing their own CRM see all statuses, public API filters to PUBLISHED
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { village: { contains: q, mode: 'insensitive' } },
      ],
    }),
    ...(listingType && { listingType }),
    ...(propertyType && { propertyType }),
    ...(region && { region }),
    ...(taluka && { taluka }),
    ...(village && { village: { contains: village, mode: 'insensitive' } }),
    ...(isFeatured !== undefined && { isFeatured }),
    ...(bedrooms !== undefined && { bedrooms: { gte: bedrooms } }),
    ...(minArea && { areaSqFt: { gte: minArea } }),
    ...(maxArea && { areaSqFt: { lte: maxArea } }),
    ...((minPrice || maxPrice) && {
      OR: [
        {
          salePrice: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          },
        },
        {
          rentPrice: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          },
        },
      ],
    }),
  };

  const orderBy = ((): Prisma.PropertyOrderByWithRelationInput => {
    switch (sort) {
      case 'oldest': return { createdAt: 'asc' };
      case 'price_asc': return { salePrice: 'asc' };
      case 'price_desc': return { salePrice: 'desc' };
      case 'area_asc': return { areaSqFt: 'asc' };
      case 'area_desc': return { areaSqFt: 'desc' };
      default: return { createdAt: 'desc' };
    }
  })();

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({ where, orderBy, skip, take: limit, select: propertyListSelect }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, limit };
}

export async function getPropertyBySlug(slug: string, userCtx: UserContext) {
  const property = await prisma.property.findUnique({
    where: { slug },
    select: propertyDetailSelect,
  });

  if (!property) throw new NotFoundError('Property');

  // Scoping check for Sales Executives
  if (userCtx.role === 'SALES_EXECUTIVE') {
    const isAssigned = property.agents.some((a) => a.agent.id === userCtx.id);
    if (!isAssigned) throw new ForbiddenError('You do not have access to this property');
  }

  return property;
}

export async function getPropertyById(id: string, userCtx: UserContext) {
  const property = await prisma.property.findUnique({
    where: { id },
    select: propertyDetailSelect,
  });

  if (!property) throw new NotFoundError('Property');

  if (userCtx.role === 'SALES_EXECUTIVE') {
    const isAssigned = property.agents.some((a) => a.agent.id === userCtx.id);
    if (!isAssigned) throw new ForbiddenError('You do not have access to this property');
  }

  return property;
}

export async function updateProperty(
  id: string,
  input: PropertyUpdateInput,
  userCtx: UserContext
) {
  // First verify access
  await getPropertyById(id, userCtx);

  const { assignedAgentIds, primaryAgentId, ...propertyData } = input;

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...propertyData,
      updatedAt: new Date(),
      // If an admin is updating, allow changing agents
      ...(assignedAgentIds && ['SUPER_ADMIN', 'CLIENT_ADMIN'].includes(userCtx.role) && {
        agents: {
          deleteMany: {},
          create: assignedAgentIds.map((agentId: string) => ({
            agentId,
            isPrimary: agentId === (primaryAgentId ?? assignedAgentIds[0]),
          })),
        },
      }),
    },
    select: propertyDetailSelect,
  });

  return property;
}

export async function approveProperty(id: string, adminId: string) {
  const property = await prisma.property.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      approvedAt: new Date(),
      approvedBy: adminId,
      publishedAt: new Date(),
    },
    select: { id: true, title: true, slug: true, status: true },
  });

  return property;
}

export async function deleteProperty(id: string, userCtx: UserContext) {
  await getPropertyById(id, userCtx);

  // Only admins can hard delete; executives archive
  if (userCtx.role === 'SALES_EXECUTIVE') {
    return prisma.property.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      select: { id: true },
    });
  }

  return prisma.property.delete({ where: { id }, select: { id: true } });
}

export async function incrementViewCount(id: string) {
  return prisma.property.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });
}
