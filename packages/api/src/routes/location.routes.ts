/**
 * LOCATION ROUTES
 *
 * Master picklist backing the Property Location field on the Add/Edit
 * Property form. Single source of truth in the database — the CRM form,
 * the public website, and CSV import all read the same list, and a new
 * entry added via "Add Location +" is visible to all of them immediately.
 *
 * GET  /api/locations - List all locations (public, no auth)
 * POST /api/locations - Add a new location (CRM users only)
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@easyliving/database';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody, ConflictError } from '../middleware/error.middleware.js';
import { locationCreateSchema } from '@easyliving/shared';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await prisma.location.findMany({ orderBy: { village: 'asc' } });
    res.json({ success: true, data: locations });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  authenticate,
  validateBody(locationCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { village, taluka, region } = req.body;
      const existing = await prisma.location.findUnique({ where: { village } });
      if (existing) throw new ConflictError(`"${village}" is already in the locations list`);

      const location = await prisma.location.create({ data: { village, taluka, region } });
      res.status(201).json({ success: true, data: location });
    } catch (err) {
      next(err);
    }
  }
);

export { router as locationRouter };
