/**
 * LOCAL-DISK STORAGE BACKEND
 *
 * Used in development when no Cloudinary credentials are configured. Files
 * are written under MEDIA_STORAGE_DIR and served statically at /uploads
 * (see app.ts). NOT suitable for serverless deployment (no persistent or
 * shared filesystem) — see cloudinary.storage.ts for the production backend.
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { safeExtensionForMimetype } from '@easyliving/shared';
import { env } from '../../config/env.js';
import type { StoredFile } from './storage.service.js';

const STORAGE_ROOT = path.resolve(process.cwd(), env.MEDIA_STORAGE_DIR);

export async function saveFile(
  buffer: Buffer,
  _originalName: string,
  mimetype: string,
  subdir: string
): Promise<StoredFile> {
  // Extension is derived from the verified MIME type, never the client-supplied
  // filename — untrusted filenames are never used to build a disk path.
  const ext = safeExtensionForMimetype(mimetype);
  const filename = `${crypto.randomUUID()}${ext}`;
  // Defence in depth: strip any ".." segments so a crafted subdir can never
  // escape STORAGE_ROOT, even though callers already pass DB-verified IDs.
  const safeSubdir = subdir.split(/[\\/]/).filter((seg) => seg && seg !== '..').join('/');
  const dir = path.join(STORAGE_ROOT, safeSubdir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  const key = path.posix.join(safeSubdir, filename);
  const base = env.MEDIA_PUBLIC_BASE_URL ?? env.API_BASE_URL;

  return { key, url: `${base}/uploads/${key}`, sizeBytes: buffer.length, mimetype };
}

export async function deleteFile(key: string): Promise<void> {
  await fs.unlink(path.join(STORAGE_ROOT, key)).catch(() => {
    // already gone — ignore
  });
}

export function keyFromUrl(url: string): string | null {
  const base = env.MEDIA_PUBLIC_BASE_URL ?? env.API_BASE_URL;
  const prefix = `${base}/uploads/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}
