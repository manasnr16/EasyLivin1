/**
 * LEAD ROUTES
 *
 * GET    /api/leads              - List leads (scoped by role)
 * POST   /api/leads              - Create lead manually
 * GET    /api/leads/stats        - Lead statistics for dashboard
 * GET    /api/leads/:id          - Get lead detail
 * PATCH  /api/leads/:id          - Update lead (stage, assignment, notes)
 * POST   /api/leads/:id/activity - Add activity note/log
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, ROLES, toUserContext } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/error.middleware.js';
import { leadCreateSchema, leadUpdateSchema, leadActivitySchema, leadSearchSchema } from '@easyliving/shared';
import * as leadService from '../services/lead/lead.service.js';

const leadRouter = Router();
leadRouter.use(authenticate);

leadRouter.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await leadService.getLeadStats(toUserContext(req.user!));
      res.json({ success: true, data: stats });
    } catch (err) { next(err); }
  }
);

leadRouter.get(
  '/stats/monthly',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const months = req.query['months'] ? Number(req.query['months']) : 6;
      const trends = await leadService.getMonthlyLeadTrends(toUserContext(req.user!), months);
      res.json({ success: true, data: trends });
    } catch (err) { next(err); }
  }
);

leadRouter.get(
  '/stats/by-agent',
  authorize(...ROLES.ADMIN_ONLY),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const performance = await leadService.getAgentPerformance();
      res.json({ success: true, data: performance });
    } catch (err) { next(err); }
  }
);

leadRouter.get(
  '/activity/recent',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query['limit'] ? Number(req.query['limit']) : 8;
      const activity = await leadService.getRecentActivity(toUserContext(req.user!), limit);
      res.json({ success: true, data: activity });
    } catch (err) { next(err); }
  }
);

leadRouter.get(
  '/',
  validateQuery(leadSearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = (req as any).parsedQuery;
      const result = await leadService.getLeads(filters, toUserContext(req.user!));
      res.json({
        success: true,
        data: result.leads,
        meta: {
          total: result.total, page: result.page, limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (err) { next(err); }
  }
);

leadRouter.post(
  '/',
  authorize(...ROLES.ALL_STAFF),
  validateBody(leadCreateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.createLead(req.body, toUserContext(req.user!));
      res.status(201).json({
        success: true,
        data: result.lead,
        ...(result.isDuplicate && { warning: 'Possible duplicate lead detected' }),
      });
    } catch (err) { next(err); }
  }
);

leadRouter.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.getLeadById(req.params['id']!, toUserContext(req.user!));
      res.json({ success: true, data: lead });
    } catch (err) { next(err); }
  }
);

leadRouter.patch(
  '/:id',
  validateBody(leadUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateLead(req.params['id']!, req.body, toUserContext(req.user!));
      res.json({ success: true, data: lead });
    } catch (err) { next(err); }
  }
);

leadRouter.post(
  '/:id/activity',
  validateBody(leadActivitySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, note } = req.body as { type: string; note: string };
      const activity = await leadService.addLeadActivity(req.params['id']!, type, note, toUserContext(req.user!));
      res.status(201).json({ success: true, data: activity });
    } catch (err) { next(err); }
  }
);

export { leadRouter };

// ── Enquiry Routes (public — no auth required) ────────────────────
/**
 * ENQUIRY ROUTES
 *
 * POST /api/enquiries  - Submit a public enquiry from the website
 *                        Converts to a Lead record automatically
 */

import { enquirySchema } from '@easyliving/shared';
import { prisma } from '@easyliving/database';
import * as leadSvc from '../services/lead/lead.service.js';

const enquiryRouter = Router();

enquiryRouter.post(
  '/',
  validateBody(enquirySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Store raw enquiry
      const enquiry = await prisma.enquiry.create({
        data: {
          ...req.body,
          source: req.body.source ?? 'WEBSITE',
        },
        select: { id: true },
      });

      // Lead.createdById / LeadActivity.userId are required FKs to a real user —
      // attribute publicly-submitted leads to the longest-standing active admin.
      const systemUser = await prisma.user.findFirst({
        where: { role: 'CLIENT_ADMIN', status: 'ACTIVE' },
        select: { id: true, role: true },
        orderBy: { createdAt: 'asc' },
      });
      if (!systemUser) {
        res.status(500).json({ success: false, error: 'No admin account is configured to receive enquiries' });
        return;
      }
      const { lead } = await leadSvc.createLead(
        { ...req.body, source: req.body.source ?? 'WEBSITE' },
        systemUser
      );

      // Link enquiry to lead
      await prisma.enquiry.update({
        where: { id: enquiry.id },
        data: { convertedToLeadId: lead.id },
      });

      // TODO Phase 2: Send WhatsApp/email notification to assigned agent

      res.status(201).json({
        success: true,
        message: 'Thank you for your enquiry! Our team will contact you shortly.',
        data: { enquiryId: enquiry.id },
      });
    } catch (err) {
      next(err);
    }
  }
);

export { enquiryRouter };

// ── Upload Routes ─────────────────────────────────────────────────
/**
 * UPLOAD ROUTES
 *
 * POST /api/uploads/properties   - Bulk upload properties via CSV/Excel
 * GET  /api/uploads/batches      - List upload batch history
 * GET  /api/uploads/template     - Download the CSV template
 */

import multer from 'multer';
import * as uploadService from '../services/upload/upload.service.js';
import { ALLOWED_UPLOAD_TYPES } from '@easyliving/shared';

const uploadRouter = Router();
uploadRouter.use(authenticate);

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [...ALLOWED_UPLOAD_TYPES];
    if (allowed.includes(file.mimetype as any) ||
        file.originalname.endsWith('.csv') ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV or Excel files are accepted'));
    }
  },
});

uploadRouter.post(
  '/properties',
  authorize(...ROLES.ADMIN_ONLY),
  fileUpload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'Please upload a CSV or Excel file' });
        return;
      }

      const result = await uploadService.processUploadedFile(
        req.file.buffer,
        req.file.originalname,
        toUserContext(req.user!)
      );

      res.status(201).json({
        success: true,
        data: result,
        message: `Upload complete: ${result.successRows} properties added, ${result.failedRows} failed.`,
      });
    } catch (err) {
      next(err);
    }
  }
);

uploadRouter.get(
  '/batches',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const batches = await uploadService.getUploadBatches(toUserContext(req.user!));
      res.json({ success: true, data: batches });
    } catch (err) { next(err); }
  }
);

// GET /api/uploads/template — returns a downloadable CSV template
uploadRouter.get('/template', (_req: Request, res: Response) => {
  const headers = [
    'title', 'propertyType', 'listingType', 'region', 'taluka', 'village',
    'salePrice', 'rentPrice', 'bedrooms', 'bathrooms', 'areaSqFt',
    'plotAreaSqFt', 'description', 'amenities', 'reraNumber', 'furnishing', 'agentEmail'
  ];

  const exampleRow = [
    '3 BHK Villa in Vagator', 'VILLA', 'SALE', 'NORTH_GOA', 'BARDEZ', 'Vagator',
    '4200000', '', '3', '3', '2200',
    '4500', 'Beautiful villa near beach', 'Pool, Garden, CCTV', 'PRGO123456', 'fully-furnished', ''
  ];

  const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="easyliving-property-template.csv"');
  res.send(csvContent);
});

export { uploadRouter };
