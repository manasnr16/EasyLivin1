/**
 * BULK UPLOAD SERVICE
 *
 * Handles CSV and Excel (.xlsx) property imports.
 *
 * Flow:
 * 1. Admin uploads file
 * 2. Parse with SheetJS (xlsx library)
 * 3. Validate each row with Zod schema
 * 4. Create an UploadBatch record for tracking
 * 5. Insert valid properties (linked to the batch)
 * 6. Return a summary with success count and row-level errors
 *
 * Properties from bulk upload start as PENDING_APPROVAL
 * so the admin can review before going live.
 */

import * as XLSX from 'xlsx';
import { prisma } from '@easyliving/database';
import { csvPropertyRowSchema, parseAmenities, slugifyUnique } from '@easyliving/shared';
import type { CsvPropertyRow } from '@easyliving/shared';
import { logger } from '../../config/logger.js';

interface RowError {
  row: number;
  errors: string[];
  data: Record<string, unknown>;
}

interface UploadResult {
  batchId: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: RowError[];
}

type UserContext = { id: string; role: string };

/**
 * Normalises a raw spreadsheet row by:
 * - Converting header keys to the expected field names (case-insensitive)
 * - Trimming string values
 * - Coercing numeric-looking strings
 */
function normaliseRow(raw: Record<string, unknown>): Record<string, unknown> {
  const KEY_MAP: Record<string, string> = {
    'title': 'title',
    'property title': 'title',
    'property type': 'propertyType',
    'propertytype': 'propertyType',
    'type': 'propertyType',
    'listing type': 'listingType',
    'listingtype': 'listingType',
    'for': 'listingType',
    'region': 'region',
    'taluka': 'taluka',
    'village': 'village',
    'area': 'village',
    'location': 'village',
    'sale price': 'salePrice',
    'saleprice': 'salePrice',
    'price': 'salePrice',
    'rent price': 'rentPrice',
    'rentprice': 'rentPrice',
    'rent': 'rentPrice',
    'bedrooms': 'bedrooms',
    'beds': 'bedrooms',
    'bhk': 'bedrooms',
    'bathrooms': 'bathrooms',
    'baths': 'bathrooms',
    'area sq ft': 'areaSqFt',
    'area (sq ft)': 'areaSqFt',
    'areasqft': 'areaSqFt',
    'built up area': 'areaSqFt',
    'plot area': 'plotAreaSqFt',
    'plot area sq ft': 'plotAreaSqFt',
    'description': 'description',
    'amenities': 'amenities',
    'rera number': 'reraNumber',
    'rera': 'reraNumber',
    'furnishing': 'furnishing',
    'agent email': 'agentEmail',
    'agent': 'agentEmail',
  };

  const normalised: Record<string, unknown> = {};

  for (const [rawKey, value] of Object.entries(raw)) {
    const mappedKey = KEY_MAP[rawKey.toLowerCase().trim()];
    if (mappedKey && value !== undefined && value !== null && value !== '') {
      normalised[mappedKey] = typeof value === 'string' ? value.trim() : value;
    }
  }

  // Normalise listingType common abbreviations
  if (normalised['listingType']) {
    const lt = String(normalised['listingType']).toUpperCase();
    if (lt === 'SALE' || lt === 'BUY' || lt === 'FOR SALE') normalised['listingType'] = 'SALE';
    else if (lt === 'RENT' || lt === 'FOR RENT' || lt === 'LEASE') normalised['listingType'] = 'RENT';
    else if (lt === 'BOTH' || lt === 'SALE AND RENT') normalised['listingType'] = 'SALE_AND_RENT';
  }

  // Normalise region
  if (normalised['region']) {
    const r = String(normalised['region']).toUpperCase().replace(/\s+/g, '_');
    if (r === 'NORTH' || r === 'NORTH_GOA') normalised['region'] = 'NORTH_GOA';
    else if (r === 'SOUTH' || r === 'SOUTH_GOA') normalised['region'] = 'SOUTH_GOA';
  }

  return normalised;
}

export async function processUploadedFile(
  buffer: Buffer,
  filename: string,
  userCtx: UserContext
): Promise<UploadResult> {
  // Parse the file
  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  } catch {
    throw new Error('Could not read the file. Please upload a valid .xlsx, .xls, or .csv file.');
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('The file appears to be empty.');

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) throw new Error('Could not read the first sheet.');

  // Convert sheet to JSON (first row = headers)
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    raw: false,
    defval: '',
  });

  if (rawRows.length === 0) {
    throw new Error('The spreadsheet has no data rows. Please check your file.');
  }

  if (rawRows.length > 500) {
    throw new Error('Maximum 500 properties per upload. Please split your file into smaller batches.');
  }

  // Create the batch record
  const batch = await prisma.uploadBatch.create({
    data: {
      uploadedById: userCtx.id,
      fileName: filename,
      totalRows: rawRows.length,
      status: 'PROCESSING',
    },
  });

  const errors: RowError[] = [];
  let successRows = 0;

  // Process each row
  for (let i = 0; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    if (!rawRow) continue;
    const rowNum = i + 2; // +2 because row 1 is headers, 0-indexed

    const normalised = normaliseRow(rawRow);
    const parsed = csvPropertyRowSchema.safeParse(normalised);

    if (!parsed.success) {
      errors.push({
        row: rowNum,
        errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
        data: normalised,
      });
      continue;
    }

    const row: CsvPropertyRow = parsed.data;

    try {
      // Resolve agent by email if provided
      let agentId = userCtx.id;
      if (row.agentEmail) {
        const agent = await prisma.user.findUnique({
          where: { email: row.agentEmail },
          select: { id: true },
        });
        if (agent) {
          agentId = agent.id;
        } else {
          errors.push({
            row: rowNum,
            errors: [`Agent with email "${row.agentEmail}" not found. Assigning to uploader.`],
            data: normalised,
          });
          // Non-fatal — continue with uploader as agent
        }
      }

      const slug = slugifyUnique(row.title);

      await prisma.property.create({
        data: {
          title: row.title,
          slug,
          propertyType: row.propertyType,
          listingType: row.listingType,
          region: row.region,
          taluka: row.taluka,
          village: row.village,
          salePrice: row.salePrice,
          rentPrice: row.rentPrice,
          bedrooms: row.bedrooms,
          bathrooms: row.bathrooms,
          areaSqFt: row.areaSqFt,
          plotAreaSqFt: row.plotAreaSqFt,
          description: row.description,
          amenities: parseAmenities(row.amenities),
          reraNumber: row.reraNumber,
          furnishing: row.furnishing as any,
          status: 'PENDING_APPROVAL',
          uploadBatchId: batch.id,
          createdById: userCtx.id,
          agents: {
            create: [{ agentId, isPrimary: true }],
          },
        },
      });

      successRows++;
    } catch (err) {
      logger.error('Row insert failed', { row: rowNum, error: (err as Error).message });
      errors.push({
        row: rowNum,
        errors: [`Failed to save: ${(err as Error).message}`],
        data: normalised,
      });
    }
  }

  // Update batch with results
  await prisma.uploadBatch.update({
    where: { id: batch.id },
    data: {
      successRows,
      failedRows: errors.length,
      status: errors.length === rawRows.length ? 'FAILED' : 'DONE',
      errorLog: errors,
      completedAt: new Date(),
    },
  });

  logger.info('Upload batch completed', {
    batchId: batch.id,
    total: rawRows.length,
    success: successRows,
    failed: errors.length,
  });

  return {
    batchId: batch.id,
    totalRows: rawRows.length,
    successRows,
    failedRows: errors.length,
    errors,
  };
}

export async function getUploadBatches(userCtx: UserContext) {
  const where = userCtx.role === 'SALES_EXECUTIVE'
    ? { uploadedById: userCtx.id }
    : {};

  return prisma.uploadBatch.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true, fileName: true, totalRows: true,
      successRows: true, failedRows: true,
      status: true, createdAt: true, completedAt: true,
      uploadedBy: { select: { firstName: true, lastName: true } },
    },
  });
}
