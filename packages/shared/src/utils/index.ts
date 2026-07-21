/**
 * SHARED UTILITIES
 *
 * Pure functions used across the API, web app, and CRM.
 * No side effects, no external dependencies — just logic.
 */

// ── Slug generation ───────────────────────────────────────────────

/**
 * Converts a property title into a URL-safe slug.
 * Example: "3 BHK Villa in Vagator!" → "3-bhk-villa-in-vagator"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')      // Remove non-word chars except spaces and hyphens
    .replace(/[\s_-]+/g, '-')      // Replace spaces/underscores/multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
}

/**
 * Generates a unique slug by appending a short random suffix.
 * Used when a plain slug would collide with an existing one.
 */
export function slugifyUnique(text: string): string {
  const base = slugify(text);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

// ── Currency formatting ───────────────────────────────────────────

/**
 * Formats a number as Indian Rupees.
 * Example: 4500000 → "₹45 Lakhs"
 *          42000000 → "₹4.2 Crores"
 *          950000 → "₹9.5 Lakhs"
 */
export function formatPriceINR(amount: number): string {
  if (amount >= 10_000_000) {
    const crores = amount / 10_000_000;
    return `₹${crores % 1 === 0 ? crores : crores.toFixed(1)} Cr`;
  }
  if (amount >= 100_000) {
    const lakhs = amount / 100_000;
    return `₹${lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1)} Lakhs`;
  }
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

/**
 * Formats a rent price with period.
 * Example: 22000, "monthly" → "₹22,000/month"
 */
export function formatRentINR(amount: number, period: string = 'monthly'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted}/${period === 'yearly' ? 'year' : 'month'}`;
}

// ── Area formatting ───────────────────────────────────────────────

export function formatArea(sqFt: number): string {
  if (sqFt >= 43560) {
    const acres = sqFt / 43560;
    return `${acres.toFixed(2)} acres`;
  }
  return `${sqFt.toLocaleString('en-IN')} sq.ft`;
}

// ── Date utilities ────────────────────────────────────────────────

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

// ── String utilities ──────────────────────────────────────────────

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ── Number utilities ──────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Normalise a phone number to E.164 format for deduplication.
 * "+91 98765-43210" → "+919876543210"
 * "9876543210" → "+919876543210" (assumes India if no country code)
 */
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

// ── API response helpers ──────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function successResponse<T>(
  data: T,
  options?: { message?: string; total?: number; page?: number; limit?: number }
): ApiSuccess<T> {
  const response: ApiSuccess<T> = { success: true, data };
  if (options?.message) response.message = options.message;
  if (options?.total !== undefined) {
    response.meta = {
      total: options.total,
      page: options.page ?? 1,
      limit: options.limit ?? 12,
      totalPages: options.limit ? Math.ceil(options.total / options.limit) : 1,
    };
  }
  return response;
}

export function errorResponse(error: string, code?: string, details?: Record<string, string[]>): ApiError {
  return { success: false, error, ...(code && { code }), ...(details && { details }) };
}

// ── CSV/Excel parsing helpers ─────────────────────────────────────

/**
 * Parses a comma-or-pipe-separated amenities string into an array.
 * "Pool, Garden | Parking" → ["Pool", "Garden", "Parking"]
 */
export function parseAmenities(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Converts Excel serial date numbers to JS Date objects.
 * Excel stores dates as days since 1900-01-01.
 */
export function excelSerialToDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}
