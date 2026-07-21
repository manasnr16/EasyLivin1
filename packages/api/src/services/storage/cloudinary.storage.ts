/**
 * CLOUDINARY STORAGE BACKEND
 *
 * Used in production (Vercel serverless has no persistent/shared filesystem,
 * so local-disk storage doesn't work there). Same saveFile/deleteFile/
 * keyFromUrl signatures as local.storage.ts — see storage.service.ts for
 * which backend gets picked.
 */

import { v2 as cloudinary } from 'cloudinary';
import { env } from '../../config/env.js';
import type { StoredFile } from './storage.service.js';

if (env.CLOUDINARY_CLOUD_NAME) {
  // Presence of CLOUDINARY_CLOUD_NAME is what selects this backend at all
  // (see storage.service.ts) — API key/secret are expected to be set alongside it.
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY ?? '',
    api_secret: env.CLOUDINARY_API_SECRET ?? '',
    secure: true,
  });
}

function resourceTypeFor(mimetype: string): 'image' | 'video' | 'raw' {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw'; // PDFs etc.
}

export async function saveFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  subdir: string
): Promise<StoredFile> {
  const resourceType = resourceTypeFor(mimetype);

  const result = await new Promise<{ secure_url: string; bytes: number }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: subdir, resource_type: resourceType },
      (err, res) => {
        if (err || !res) return reject(err ?? new Error('Cloudinary upload returned no result'));
        resolve(res);
      }
    );
    uploadStream.end(buffer);
  });

  return { key: result.secure_url, url: result.secure_url, sizeBytes: result.bytes, mimetype };
}

export async function deleteFile(key: string): Promise<void> {
  const parsed = parseCloudinaryUrl(key);
  if (!parsed) return;
  await cloudinary.uploader.destroy(parsed.publicId, { resource_type: parsed.resourceType }).catch(() => {
    // already gone or never existed — ignore
  });
}

export function keyFromUrl(url: string): string | null {
  // For Cloudinary we store the full secure_url as the key (see saveFile above) —
  // deleteFile re-parses it into a public_id, so just pass the URL straight through.
  return url.includes('res.cloudinary.com') ? url : null;
}

function parseCloudinaryUrl(url: string): { publicId: string; resourceType: 'image' | 'video' | 'raw' } | null {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v1234567890/properties/<id>/<uuid>.jpg
  const match = url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  const resourceType = match?.[1];
  const publicId = match?.[2];
  if (!resourceType || !publicId) return null;
  return { publicId, resourceType: resourceType as 'image' | 'video' | 'raw' };
}
