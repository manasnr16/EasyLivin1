/**
 * ZOD VALIDATORS
 *
 * Single source of truth for all input validation.
 * These schemas are used in:
 *  - API routes (request body validation)
 *  - React Hook Form (frontend form validation)
 *
 * Zod infers TypeScript types from schemas, so we get
 * type safety AND runtime validation from one definition.
 */

import { z } from 'zod';
import { getFieldsForPropertyType, type SpecField } from '../constants/index.js';

// ── Reusable field schemas ────────────────────────────────────────

// Mirrors the PropertyType enum in prisma/schema.prisma — keep in sync.
export const PROPERTY_TYPE_VALUES = [
  'APARTMENTS_PENTHOUSES',
  'BUNGALOWS_VILLAS',
  'PORTUGUESE_GOAN_HOUSE',
  'PLOTS',
  'BEACH_RIVERSIDE_PROPERTIES',
  'APPROVED_PROJECTS',
  'RESORT_AND_PLOTS_FOR_RESORTS',
  'OFFICE',
  'SHOP_SHOWROOMS',
  'INDUSTRIAL_SHEDS_PLOTS_GODOWN',
  'AGRICULTURE_FARM_ORCHARD_LAND',
  'VILLA',
  'ROW_HOUSE_DUPLEX',
  'RESTAURANT',
  'RESORT_FOR_LEASE_RENT',
  'BEAUTY_PARLOUR',
  'BOUTIQUE_RESORT',
  'HOTEL',
  'TREE_HOUSE_STAFF_QUARTERS',
] as const;

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{9,14}$/, 'Enter a valid phone number (10–15 digits)');

export const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens');

export const cuidSchema = z.string().cuid('Invalid ID format');

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ── Auth ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50),
  // Agent registration is the only user-facing creation path — CLIENT_ADMIN is
  // the sole admin role. MARKETING_MANAGER stays in the schema for future use
  // but is never assignable here.
  role: z.literal('SALES_EXECUTIVE').default('SALES_EXECUTIVE'),
  locationTags: z.array(z.enum([
    'BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI',
    'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA',
  ])).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const userStatusUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});
export type UserStatusUpdateInput = z.infer<typeof userStatusUpdateSchema>;

export const userDeleteSchema = z.object({
  reassignToId: cuidSchema.optional(),
});
export type UserDeleteInput = z.infer<typeof userDeleteSchema>;

export const profileUpdateSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50).optional(),
  lastName: z.string().trim().min(2, 'Last name must be at least 2 characters').max(50).optional(),
  phone: phoneSchema.optional(),
  locationTags: z.array(z.enum([
    'BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI',
    'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA',
  ])).optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ── Properties ───────────────────────────────────────────────────

const propertyBaseSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().trim().max(5000).optional(),
  propertyType: z.enum(PROPERTY_TYPE_VALUES),
  listingType: z.enum(['SALE', 'RENT', 'SALE_AND_RENT']),
  region: z.enum(['NORTH_GOA', 'SOUTH_GOA']),
  taluka: z.enum([
    'BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI',
    'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA',
  ]),
  village: z.string().trim().min(2).max(100),
  address: z.string().trim().max(300).optional(),
  landmark: z.string().trim().max(200).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit pincode').optional(),
  googleMapsUrl: z.string().trim().url('Enter a valid URL').max(500).optional().or(z.literal('')),

  salePrice: z.coerce.number().positive('Sale price must be positive').optional(),
  rentPrice: z.coerce.number().positive('Rent price must be positive').optional(),
  rentPeriod: z.enum(['monthly', 'yearly']).optional(),
  priceNegotiable: z.coerce.boolean().default(false),
  priceOnRequest: z.coerce.boolean().default(false),

  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  areaSqFt: z.coerce.number().positive().optional(),
  plotAreaSqFt: z.coerce.number().positive().optional(),
  floors: z.coerce.number().int().min(1).max(100).optional(),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']).optional(),
  parking: z.coerce.number().int().min(0).max(10).default(0),
  facing: z.string().optional(),

  reraNumber: z.string().trim().max(50).optional(),
  reraExpiry: z.coerce.date().optional(),
  possessionStatus: z.enum(['ready', 'under-construction']).optional(),
  possessionDate: z.coerce.date().optional(),

  amenities: z.array(z.string()).default([]),
  isFeatured: z.coerce.boolean().default(false),
  isPremium: z.coerce.boolean().default(false),
  isExclusive: z.coerce.boolean().default(false),

  metaTitle: z.string().trim().max(70).optional(),
  metaDescription: z.string().trim().max(160).optional(),

  assignedAgentIds: z.array(cuidSchema).optional(),
  primaryAgentId: cuidSchema.optional(),
});

// Fields where a positive value for a category that doesn't use them is
// contradictory data (e.g. bedrooms: 3 on a Plot), not just an unused key —
// these get hard-rejected. Everything else that FIELD_CONFIG excludes for a
// given type is stripped silently instead (see applyFieldConfig below).
const SIZE_COUNT_FIELDS: SpecField[] = ['bedrooms', 'bathrooms', 'areaSqFt', 'plotAreaSqFt'];
const STRIPPABLE_FIELDS: SpecField[] = ['furnishing', 'possessionStatus', 'reraNumber'];

/**
 * Cross-checks propertyType against the shared FIELD_CONFIG map (see
 * packages/shared/src/constants) so a payload can't smuggle in spec fields
 * that don't apply to its category — closing the gap for callers that
 * bypass the CRM form entirely (a direct API call, a future mobile client,
 * or CSV bulk import).
 *
 * Soft by design: a field that's merely inapplicable but empty/zero (e.g.
 * furnishing on a Plot, a leftover parking default) is stripped silently so
 * existing callers that send the full object shape with unused fields as
 * undefined keep working. Only a size/count field with an actual positive
 * value for a category that can't have one (bedrooms: 3 on a Plot) is
 * treated as contradictory data and rejected.
 */
function applyFieldConfig<T extends Record<string, unknown> & { propertyType?: string | undefined }>(
  data: T,
  ctx: z.RefinementCtx,
): T {
  if (!data.propertyType) return data;
  const applicable = getFieldsForPropertyType(data.propertyType);
  const result: Record<string, unknown> = { ...data };

  for (const field of SIZE_COUNT_FIELDS) {
    if (!(field in result) || applicable.includes(field)) continue;
    const value = result[field];
    if (typeof value === 'number' && value > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${field} does not apply to property type ${data.propertyType} and should be left blank`,
      });
    } else {
      result[field] = undefined;
    }
  }

  for (const field of STRIPPABLE_FIELDS) {
    if (field in result && !applicable.includes(field)) result[field] = undefined;
  }

  return result as T;
}

export const propertyCreateSchema = propertyBaseSchema.refine((data) => {
  if (data.listingType === 'SALE' || data.listingType === 'SALE_AND_RENT') {
    if (!data.priceOnRequest && !data.salePrice) {
      return false;
    }
  }
  return true;
}, {
  message: 'Sale price is required (or mark as Price on Request)',
  path: ['salePrice'],
}).refine((data) => {
  if (data.listingType === 'RENT' || data.listingType === 'SALE_AND_RENT') {
    return !!data.rentPrice;
  }
  return true;
}, {
  message: 'Rent price is required for rental listings',
  path: ['rentPrice'],
}).transform(applyFieldConfig);

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
// A partial update doesn't need the create-time sale/rent-price refinements to
// hold — a PATCH that only touches, say, the description shouldn't be forced
// to also satisfy "sale price required for SALE listings".
// applyFieldConfig only runs its cross-check when propertyType is present in
// the payload — a PATCH that omits it (and so doesn't touch any spec fields
// either) passes through untouched.
export const propertyUpdateSchema = propertyBaseSchema.partial().transform(applyFieldConfig);
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;

export const propertySearchSchema = paginationSchema.extend({
  listingType: z.enum(['SALE', 'RENT', 'SALE_AND_RENT']).optional(),
  propertyType: z.enum(PROPERTY_TYPE_VALUES).optional(),
  region: z.enum(['NORTH_GOA', 'SOUTH_GOA']).optional(),
  taluka: z.string().optional(),
  village: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  minArea: z.coerce.number().positive().optional(),
  maxArea: z.coerce.number().positive().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'area_asc', 'area_desc']).default('newest'),
  q: z.string().trim().max(100).optional(), // text search
});
export type PropertySearchInput = z.infer<typeof propertySearchSchema>;

// ── Leads ─────────────────────────────────────────────────────────

export const enquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  message: z.string().trim().max(1000).optional(),
  propertyId: cuidSchema.optional(),
  source: z.enum([
    'WEBSITE', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM',
    'LINKEDIN', 'YOUTUBE', 'MAGICBRICKS', 'ACRES_99',
    'REFERRAL', 'WALK_IN', 'OTHER',
  ]).default('WEBSITE'),
});
export type EnquiryInput = z.infer<typeof enquirySchema>;

export const leadCreateSchema = enquirySchema.extend({
  alternatePhone: phoneSchema.optional(),
  city: z.string().trim().max(100).optional(),
  budget: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  requirementNote: z.string().trim().max(2000).optional(),
  interestedIn: z.enum(PROPERTY_TYPE_VALUES).optional(),
  preferredRegion: z.enum(['NORTH_GOA', 'SOUTH_GOA']).optional(),
  preferredTaluka: z.string().optional(),
  assignedToId: cuidSchema.optional(),
});
export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

export const leadUpdateSchema = z.object({
  stage: z.enum([
    'NEW', 'CONTACTED', 'SITE_VISIT_SCHEDULED', 'SITE_VISIT_DONE',
    'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST',
  ]).optional(),
  assignedToId: cuidSchema.optional().nullable(),
  budget: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  requirementNote: z.string().trim().max(2000).optional(),
  status: z.enum(['ACTIVE', 'DUPLICATE', 'JUNK']).optional(),
});
export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

export const leadActivitySchema = z.object({
  // The lead is identified by the :id route param, not this field — kept
  // optional for backwards-compat with any client that still sends it.
  leadId: cuidSchema.optional(),
  type: z.enum(['note', 'stage_change', 'assignment', 'email', 'call', 'whatsapp', 'site_visit']),
  note: z.string().trim().max(2000).optional(),
});
export type LeadActivityInput = z.infer<typeof leadActivitySchema>;

export const leadSearchSchema = paginationSchema.extend({
  stage: z.string().optional(),
  source: z.string().optional(),
  assignedToId: cuidSchema.optional(),
  status: z.enum(['ACTIVE', 'DUPLICATE', 'JUNK']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  q: z.string().trim().max(100).optional(),
});
export type LeadSearchInput = z.infer<typeof leadSearchSchema>;

// ── CSV Upload row schema ─────────────────────────────────────────
// Validates each row after parsing the Excel/CSV file

export const csvPropertyRowSchema = z.object({
  title: z.string().trim().min(5).max(200),
  propertyType: z.enum(PROPERTY_TYPE_VALUES, {
    errorMap: () => ({ message: `Property type must be one of: ${PROPERTY_TYPE_VALUES.join(', ')}` }),
  }),
  listingType: z.enum(['SALE', 'RENT', 'SALE_AND_RENT'], {
    errorMap: () => ({ message: 'Listing type must be: SALE, RENT, or SALE_AND_RENT' }),
  }),
  region: z.enum(['NORTH_GOA', 'SOUTH_GOA'], {
    errorMap: () => ({ message: 'Region must be: NORTH_GOA or SOUTH_GOA' }),
  }),
  taluka: z.enum([
    'BARDEZ', 'PERNEM', 'BICHOLIM', 'TISWADI',
    'SALCETE', 'MORMUGAO', 'QUEPEM', 'SANGUEM', 'CANACONA', 'PONDA',
  ]),
  village: z.string().trim().min(2).max(100),
  salePrice: z.coerce.number().positive().optional(),
  rentPrice: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  bathrooms: z.coerce.number().int().min(0).max(20).optional(),
  areaSqFt: z.coerce.number().positive().optional(),
  plotAreaSqFt: z.coerce.number().positive().optional(),
  description: z.string().max(5000).optional(),
  amenities: z.string().optional(), // "Pool, Garden, Parking" — pipe or comma separated
  reraNumber: z.string().max(50).optional(),
  furnishing: z.enum(['unfurnished', 'semi-furnished', 'fully-furnished']).optional(),
  agentEmail: z.string().email().optional(), // to assign to a specific agent by email
}).transform(applyFieldConfig);
export type CsvPropertyRow = z.infer<typeof csvPropertyRowSchema>;
