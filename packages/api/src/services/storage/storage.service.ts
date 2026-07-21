/**
 * STORAGE FACADE
 *
 * Dispatches to Cloudinary when credentials are configured (production /
 * Vercel serverless, which has no persistent filesystem), otherwise falls
 * back to local disk (local dev, zero setup required). Callers only ever
 * import from this file — never local.storage.ts / cloudinary.storage.ts
 * directly — so nothing above this module needs to know which backend is
 * active.
 */

import { env } from '../../config/env.js';
import * as localStorage from './local.storage.js';
import * as cloudinaryStorage from './cloudinary.storage.js';

export interface StoredFile {
  key: string;
  url: string;
  sizeBytes: number;
  mimetype: string;
}

const backend = env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage;

export function saveFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  subdir: string
): Promise<StoredFile> {
  return backend.saveFile(buffer, originalName, mimetype, subdir);
}

export function deleteFile(key: string): Promise<void> {
  return backend.deleteFile(key);
}

export function keyFromUrl(url: string): string | null {
  return backend.keyFromUrl(url);
}
