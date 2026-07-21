/**
 * PROPERTY ROUTES
 *
 * GET    /api/properties              - List properties (scoped by role)
 * POST   /api/properties              - Create property
 * GET    /api/properties/:id          - Get property by ID
 * PUT    /api/properties/:id          - Update property
 * DELETE /api/properties/:id          - Delete/archive property
 * PUT    /api/properties/:id/approve  - Admin: approve & publish
 * POST   /api/properties/:id/media    - Upload media for a property
 * DELETE /api/properties/:id/media/:mediaId - Delete a media item
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate, authorize, ROLES, toUserContext } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery, NotFoundError } from '../middleware/error.middleware.js';
import { propertyCreateSchema, propertyUpdateSchema, propertySearchSchema } from '@easyliving/shared';
import * as propertyService from '../services/property/property.service.js';
import * as storageService from '../services/storage/storage.service.js';
import { prisma } from '@easyliving/database';
import type { MediaType } from '@easyliving/database';

const router = Router();

// Multer config for media uploads (memory storage — files go straight to Cloudinary)
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`));
    }
  },
});

// All property routes require authentication
router.use(authenticate);

// GET /api/properties
router.get(
  '/',
  validateQuery(propertySearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = (req as any).parsedQuery;
      const result = await propertyService.getProperties(filters, toUserContext(req.user!));
      res.json({
        success: true,
        data: result.properties,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/properties
router.post(
  '/',
  authorize(...ROLES.ALL_STAFF),
  validateBody(propertyCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.createProperty(req.body, toUserContext(req.user!));
      res.status(201).json({ success: true, data: property, message: 'Property created successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/properties/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await propertyService.getPropertyById(req.params['id']!, toUserContext(req.user!));
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id
router.put(
  '/:id',
  authorize(...ROLES.ALL_STAFF),
  validateBody(propertyUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.updateProperty(req.params['id']!, req.body, toUserContext(req.user!));
      res.json({ success: true, data: property, message: 'Property updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/properties/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await propertyService.deleteProperty(req.params['id']!, toUserContext(req.user!));
    res.json({ success: true, message: 'Property removed successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/properties/:id/approve (Admin only)
router.put(
  '/:id/approve',
  authorize(...ROLES.ADMIN_ONLY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await propertyService.approveProperty(req.params['id']!, req.user!.sub);
      res.json({ success: true, data: property, message: 'Property published successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/properties/:id/media
router.post(
  '/:id/media',
  authorize(...ROLES.ALL_STAFF),
  mediaUpload.array('files', 20),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const propertyId = req.params['id']!;
      const files = req.files as Express.Multer.File[];

      if (!files?.length) {
        res.status(400).json({ success: false, error: 'No files provided' });
        return;
      }

      // Verify property access
      await propertyService.getPropertyById(propertyId, toUserContext(req.user!));

      const existingCount = await prisma.propertyMedia.count({ where: { propertyId } });

      const created = await Promise.all(
        files.map(async (file, i) => {
          const stored = await storageService.saveFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            `properties/${propertyId}`
          );
          const mediaType: MediaType = file.mimetype.startsWith('video/')
            ? 'VIDEO'
            : file.mimetype === 'application/pdf'
            ? 'BROCHURE'
            : 'IMAGE';

          return prisma.propertyMedia.create({
            data: {
              propertyId,
              mediaType,
              url: stored.url,
              fileSizeBytes: stored.sizeBytes,
              sortOrder: existingCount + i,
              isCover: existingCount === 0 && i === 0,
            },
            select: { id: true, url: true, mediaType: true, isCover: true, sortOrder: true },
          });
        })
      );

      res.status(201).json({ success: true, message: `${created.length} file(s) uploaded`, data: created });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/properties/:id/media/:mediaId
router.delete(
  '/:id/media/:mediaId',
  authorize(...ROLES.ALL_STAFF),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: propertyId, mediaId } = req.params as { id: string; mediaId: string };

      await propertyService.getPropertyById(propertyId, toUserContext(req.user!));

      const media = await prisma.propertyMedia.findFirst({
        where: { id: mediaId, propertyId },
        select: { id: true, url: true },
      });

      if (!media) throw new NotFoundError('Media');

      await prisma.propertyMedia.delete({ where: { id: mediaId } });

      const key = storageService.keyFromUrl(media.url);
      if (key) await storageService.deleteFile(key);

      res.json({ success: true, message: 'Media deleted' });
    } catch (err) {
      next(err);
    }
  }
);

export { router as propertyRouter };
