/**
 * USER (AGENT) MANAGEMENT ROUTES — admin only
 *
 * GET    /api/users            - List staff users with property/lead counts
 * GET    /api/users/:id        - User detail
 * PATCH  /api/users/:id/status - Activate/suspend a user
 * DELETE /api/users/:id        - Delete (or deactivate + reassign) a user
 *
 * Agent creation is NOT duplicated here — the CRM calls the existing,
 * already-solid POST /api/auth/register directly.
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate, authorize, ROLES } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/error.middleware.js';
import { userStatusUpdateSchema, userDeleteSchema } from '@easyliving/shared';
import * as userService from '../services/user/user.service.js';

const router = Router();

router.use(authenticate, authorize(...ROLES.ADMIN_ONLY));

// GET /api/users
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, status } = req.query as { role?: string; status?: string };
    const users = await userService.listUsers({ ...(role && { role }), ...(status && { status }) });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.params['id']!);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status
router.patch(
  '/:id/status',
  validateBody(userStatusUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body as { status: 'ACTIVE' | 'SUSPENDED' };
      const user = await userService.setUserStatus(req.params['id']!, status);
      res.json({ success: true, data: user, message: `User ${status === 'ACTIVE' ? 'activated' : 'suspended'}` });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/users/:id
router.delete(
  '/:id',
  validateBody(userDeleteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reassignToId } = req.body as { reassignToId?: string };
      const result = await userService.deleteOrDeactivateUser(req.params['id']!, reassignToId, req.user!.sub);
      res.json({
        success: true,
        data: result,
        message: result.mode === 'DELETED' ? 'Agent deleted' : 'Agent deactivated and their leads/properties reassigned',
      });
    } catch (err) {
      next(err);
    }
  }
);

export { router as userRouter };
