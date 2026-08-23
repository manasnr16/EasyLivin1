/**
 * TESTS: Validators
 *
 * Tests every Zod validator schema with valid, invalid, and edge-case inputs.
 */

import { describe, it, expect } from 'vitest';
import {
  loginSchema, registerSchema, propertyCreateSchema,
  enquirySchema, csvPropertyRowSchema,
  phoneSchema, emailSchema, passwordSchema,
} from '../../../shared/src/validators/index.js';

// ── Field schemas ─────────────────────────────────────────────────

describe('phoneSchema', () => {
  it('accepts valid Indian mobile number', () => {
    expect(phoneSchema.safeParse('+919876543210').success).toBe(true);
  });

  it('accepts 10-digit number', () => {
    expect(phoneSchema.safeParse('9876543210').success).toBe(true);
  });

  it('rejects too short number', () => {
    expect(phoneSchema.safeParse('12345').success).toBe(false);
  });

  it('rejects letters', () => {
    expect(phoneSchema.safeParse('abc1234567').success).toBe(false);
  });
});

describe('emailSchema', () => {
  it('accepts valid email', () => {
    const result = emailSchema.safeParse('User@Example.COM');
    expect(result.success).toBe(true);
    // Should be lowercased
    if (result.success) expect(result.data).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
  });

  it('rejects email without domain', () => {
    expect(emailSchema.safeParse('user@').success).toBe(false);
  });
});

describe('passwordSchema', () => {
  it('accepts a strong password', () => {
    expect(passwordSchema.safeParse('Secure@123').success).toBe(true);
  });

  it('rejects short password', () => {
    expect(passwordSchema.safeParse('Ab@1').success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(passwordSchema.safeParse('secure@123').success).toBe(false);
  });

  it('rejects password without special char', () => {
    expect(passwordSchema.safeParse('Secure123').success).toBe(false);
  });

  it('rejects password without number', () => {
    expect(passwordSchema.safeParse('Secure@abc').success).toBe(false);
  });
});

// ── Auth schemas ──────────────────────────────────────────────────

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'anything' });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'invalid', password: 'pass' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    email: 'agent@test.com',
    phone: '+919876543210',
    password: 'Agent@123',
    firstName: 'Rahul',
    lastName: 'Fernandes',
  };

  it('accepts valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('defaults role to SALES_EXECUTIVE', () => {
    const result = registerSchema.safeParse(valid);
    if (result.success) expect(result.data.role).toBe('SALES_EXECUTIVE');
  });

  it('rejects short first name', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: 'A' }).success).toBe(false);
  });

  it('rejects weak password', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'weak' }).success).toBe(false);
  });
});

// ── Property schemas ──────────────────────────────────────────────

describe('propertyCreateSchema', () => {
  const valid = {
    title: 'Beautiful Villa in Vagator',
    propertyType: 'VILLA',
    listingType: 'SALE',
    region: 'NORTH_GOA',
    taluka: 'BARDEZ',
    village: 'Vagator',
    salePrice: 4200000,
  };

  it('accepts minimal valid property', () => {
    const result = propertyCreateSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('requires salePrice for SALE listings', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, salePrice: undefined });
    expect(result.success).toBe(false);
  });

  it('accepts PRICE_ON_REQUEST in place of salePrice', () => {
    const result = propertyCreateSchema.safeParse({
      ...valid,
      salePrice: undefined,
      priceOnRequest: true,
    });
    expect(result.success).toBe(true);
  });

  it('requires rentPrice for RENT listings', () => {
    const result = propertyCreateSchema.safeParse({
      ...valid,
      listingType: 'RENT',
      salePrice: undefined,
    });
    expect(result.success).toBe(false);
  });

  it('accepts rentPrice for RENT listings', () => {
    const result = propertyCreateSchema.safeParse({
      ...valid,
      listingType: 'RENT',
      salePrice: undefined,
      rentPrice: 25000,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid propertyType', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, propertyType: 'HOUSEBOAT' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid taluka', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, taluka: 'UNKNOWN_TALUKA' });
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, salePrice: -1000 });
    expect(result.success).toBe(false);
  });

  it('rejects title too short', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, title: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid pincode (not 6 digits)', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, pincode: '1234' });
    expect(result.success).toBe(false);
  });

  it('accepts valid pincode', () => {
    const result = propertyCreateSchema.safeParse({ ...valid, pincode: '403516' });
    expect(result.success).toBe(true);
  });
});

// ── Enquiry schema ────────────────────────────────────────────────

describe('enquirySchema', () => {
  const valid = {
    name: 'Arjun Mehta',
    phone: '+919988776655',
    message: 'Interested in the villa',
  };

  it('accepts valid enquiry', () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });

  it('accepts without email', () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });

  it('defaults source to WEBSITE', () => {
    const result = enquirySchema.safeParse(valid);
    if (result.success) expect(result.data.source).toBe('WEBSITE');
  });

  it('rejects very short name', () => {
    expect(enquirySchema.safeParse({ ...valid, name: 'A' }).success).toBe(false);
  });
});

// ── CSV row schema ────────────────────────────────────────────────

describe('csvPropertyRowSchema', () => {
  const valid = {
    title: 'Studio Apartment in Calangute',
    propertyType: 'APARTMENTS_PENTHOUSES',
    listingType: 'RENT',
    region: 'NORTH_GOA',
    taluka: 'BARDEZ',
    village: 'Calangute',
    rentPrice: 15000,
  };

  it('accepts a valid CSV row', () => {
    expect(csvPropertyRowSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid property type', () => {
    expect(csvPropertyRowSchema.safeParse({ ...valid, propertyType: 'BOAT' }).success).toBe(false);
  });

  it('coerces string number to number', () => {
    const result = csvPropertyRowSchema.safeParse({ ...valid, rentPrice: '15000' });
    expect(result.success).toBe(true);
    if (result.success) expect(typeof result.data.rentPrice).toBe('number');
  });

  it('accepts optional fields as empty strings (treated as undefined)', () => {
    const result = csvPropertyRowSchema.safeParse({
      ...valid,
      description: '',
      reraNumber: '',
    });
    // Empty string for optional fields should still pass
    expect(result.success).toBe(true);
  });
});
