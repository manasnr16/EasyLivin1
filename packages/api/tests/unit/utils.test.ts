/**
 * TESTS: Shared Utilities
 *
 * Tests for the pure utility functions used across the platform.
 * These have no dependencies and are easy to test exhaustively.
 */

import { describe, it, expect } from 'vitest';
import {
  slugify, slugifyUnique, formatPriceINR, formatRentINR,
  formatArea, normalisePhone, truncate, initials,
  parseAmenities, successResponse, errorResponse,
} from '../../../shared/src/utils/index.js';

describe('slugify', () => {
  it('converts a basic title to a slug', () => {
    expect(slugify('3 BHK Villa in Vagator')).toBe('3-bhk-villa-in-vagator');
  });

  it('removes special characters', () => {
    expect(slugify('Luxury Villa! (New)')).toBe('luxury-villa-new');
  });

  it('handles multiple spaces', () => {
    expect(slugify('A   B   C')).toBe('a-b-c');
  });

  it('trims leading and trailing spaces', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles an already-lowercase string', () => {
    expect(slugify('already-a-slug')).toBe('already-a-slug');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles strings with only special chars', () => {
    expect(slugify('!@#$%')).toBe('');
  });
});

describe('slugifyUnique', () => {
  it('returns a string containing the base slug', () => {
    const slug = slugifyUnique('My Property');
    expect(slug).toMatch(/^my-property-[a-z0-9]+$/);
  });

  it('returns different slugs on multiple calls', () => {
    const a = slugifyUnique('Same Title');
    const b = slugifyUnique('Same Title');
    expect(a).not.toBe(b);
  });
});

describe('formatPriceINR', () => {
  it('formats crores correctly', () => {
    expect(formatPriceINR(10000000)).toBe('₹1 Cr');
    expect(formatPriceINR(45000000)).toBe('₹4.5 Cr');
    expect(formatPriceINR(20000000)).toBe('₹2 Cr');
  });

  it('formats lakhs correctly', () => {
    expect(formatPriceINR(4200000)).toBe('₹42 Lakhs');
    expect(formatPriceINR(500000)).toBe('₹5 Lakhs');
    expect(formatPriceINR(1500000)).toBe('₹15 Lakhs');
  });

  it('formats decimal crores', () => {
    expect(formatPriceINR(15000000)).toBe('₹1.5 Cr');
  });

  it('formats decimal lakhs', () => {
    expect(formatPriceINR(4250000)).toBe('₹42.5 Lakhs');
  });
});

describe('formatRentINR', () => {
  it('formats monthly rent', () => {
    expect(formatRentINR(22000, 'monthly')).toContain('/month');
  });

  it('formats yearly rent', () => {
    expect(formatRentINR(250000, 'yearly')).toContain('/year');
  });

  it('defaults to monthly', () => {
    expect(formatRentINR(15000)).toContain('/month');
  });
});

describe('formatArea', () => {
  it('formats sq ft for small areas', () => {
    expect(formatArea(2200)).toContain('sq.ft');
  });

  it('converts to acres for large areas', () => {
    expect(formatArea(43560)).toContain('acres');
    expect(formatArea(43560)).toContain('1.00');
  });
});

describe('normalisePhone', () => {
  it('adds +91 to 10-digit Indian numbers', () => {
    expect(normalisePhone('9876543210')).toBe('+919876543210');
  });

  it('handles numbers with spaces and dashes', () => {
    expect(normalisePhone('+91 98765-43210')).toBe('+919876543210');
  });

  it('handles already-normalised E.164 numbers', () => {
    expect(normalisePhone('+919876543210')).toBe('+919876543210');
  });

  it('handles 91-prefixed numbers without plus', () => {
    expect(normalisePhone('919876543210')).toBe('+919876543210');
  });
});

describe('truncate', () => {
  it('does not truncate short strings', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates at maxLength with ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
    expect(truncate('Hello World', 8)).toHaveLength(8);
  });

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });
});

describe('initials', () => {
  it('returns uppercase initials', () => {
    expect(initials('urmilla', 'dias')).toBe('UD');
  });

  it('handles already uppercase', () => {
    expect(initials('Rahul', 'Fernandes')).toBe('RF');
  });
});

describe('parseAmenities', () => {
  it('parses comma-separated values', () => {
    expect(parseAmenities('Pool, Garden, Parking')).toEqual(['Pool', 'Garden', 'Parking']);
  });

  it('parses pipe-separated values', () => {
    expect(parseAmenities('Pool|Garden|Parking')).toEqual(['Pool', 'Garden', 'Parking']);
  });

  it('handles mixed separators', () => {
    expect(parseAmenities('Pool, Garden | Parking')).toEqual(['Pool', 'Garden', 'Parking']);
  });

  it('returns empty array for undefined', () => {
    expect(parseAmenities(undefined)).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseAmenities('')).toEqual([]);
  });

  it('trims whitespace from values', () => {
    expect(parseAmenities('  Pool  ,  Garden  ')).toEqual(['Pool', 'Garden']);
  });
});

describe('successResponse', () => {
  it('returns a success shape with data', () => {
    const res = successResponse({ id: '1' });
    expect(res.success).toBe(true);
    expect(res.data).toEqual({ id: '1' });
  });

  it('includes meta when total is provided', () => {
    const res = successResponse([], { total: 100, page: 2, limit: 12 });
    expect(res.meta?.total).toBe(100);
    expect(res.meta?.totalPages).toBe(9);
  });

  it('includes optional message', () => {
    const res = successResponse(null, { message: 'Done' });
    expect(res.message).toBe('Done');
  });
});

describe('errorResponse', () => {
  it('returns a failure shape', () => {
    const res = errorResponse('Something went wrong');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Something went wrong');
  });

  it('includes code when provided', () => {
    const res = errorResponse('Not found', 'NOT_FOUND');
    expect(res.code).toBe('NOT_FOUND');
  });
});
