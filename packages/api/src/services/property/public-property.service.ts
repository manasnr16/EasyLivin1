/**
 * PUBLIC PROPERTY SERVICE
 *
 * Serves the public website. No authentication, no agent scoping —
 * always and only status: PUBLISHED. Kept in its own file (rather than
 * branching inside property.service.ts) so the staff-scoped query logic
 * in that file can never accidentally leak drafts to the public.
 */

import { prisma } from '@easyliving/database';
import type { Prisma } from '@easyliving/database';
import { NotFoundError } from '../../middleware/error.middleware.js';
import type { PropertySearchInput } from '@easyliving/shared';
import { propertyListSelect, propertyDetailSelect } from './property.service.js';

export async function getPublicProperties(filters: PropertySearchInput) {
  const { page, limit, sort, q, listingType, propertyType, region, taluka, village,
          minPrice, maxPrice, bedrooms, minArea, maxArea, isFeatured } = filters;

  const skip = (page - 1) * limit;

  const where = {
    status: 'PUBLISHED',
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
        { salePrice: { ...(minPrice && { gte: minPrice }), ...(maxPrice && { lte: maxPrice }) } },
        { rentPrice: { ...(minPrice && { gte: minPrice }), ...(maxPrice && { lte: maxPrice }) } },
      ],
    }),
  } as Prisma.PropertyWhereInput;

  const orderBy = ((): Prisma.PropertyOrderByWithRelationInput => {
    switch (sort) {
      case 'oldest': return { createdAt: 'asc' };
      case 'price_asc': return { salePrice: 'asc' };
      case 'price_desc': return { salePrice: 'desc' };
      case 'area_asc': return { areaSqFt: 'asc' };
      case 'area_desc': return { areaSqFt: 'desc' };
      default: return { publishedAt: 'desc' };
    }
  })();

  const [properties, total] = await prisma.$transaction([
    prisma.property.findMany({ where, orderBy, skip, take: limit, select: propertyListSelect }),
    prisma.property.count({ where }),
  ]);

  return { properties, total, page, limit };
}

export async function getPublicPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    select: propertyDetailSelect,
  });

  if (!property || property.status !== 'PUBLISHED') {
    throw new NotFoundError('Property');
  }

  // Fire-and-forget view count bump — never block the response on it
  prisma.property.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  return property;
}
