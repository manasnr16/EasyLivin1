/**
 * PUBLIC PROPERTY ROUTES — no auth, consumed by the public website
 *
 * GET /api/public/properties       - List published properties
 * GET /api/public/properties/:slug - Published property detail by slug
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validateQuery } from '../middleware/error.middleware.js';
import { propertySearchSchema } from '@easyliving/shared';
import * as publicPropertyService from '../services/property/public-property.service.js';

const router = Router();

router.get(
  '/',
  validateQuery(propertySearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = (req as any).parsedQuery;
      const result = await publicPropertyService.getPublicProperties(filters);
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

router.get('/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await publicPropertyService.getPublicPropertyBySlug(req.params['slug']!);
    res.json({ success: true, data: property });
  } catch (err) {
    next(err);
  }
});

export { router as publicPropertyRouter };
