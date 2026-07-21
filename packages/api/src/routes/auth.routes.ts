/**
 * AUTH ROUTES
 *
 * POST /api/auth/login           - Login, returns token pair
 * POST /api/auth/register        - Register a new agent (admin only)
 * POST /api/auth/refresh         - Rotate access token using refresh token
 * POST /api/auth/logout          - Invalidate refresh token
 * POST /api/auth/forgot-password - Request password reset email
 * POST /api/auth/reset-password  - Reset password with token
 * PUT  /api/auth/change-password - Change own password (authenticated)
 * GET  /api/auth/me              - Get own profile
 */

import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { validateBody } from '../middleware/error.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  loginSchema, registerSchema, forgotPasswordSchema,
  resetPasswordSchema, changePasswordSchema, profileUpdateSchema,
} from '@easyliving/shared';
import * as authService from '../services/auth/auth.service.js';
import { prisma } from '@easyliving/database';

const router = Router();

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (Admin only — agents don't self-register publicly)
router.post(
  '/register',
  authenticate,
  authorize('SUPER_ADMIN', 'CLIENT_ADMIN'),
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, verificationToken: _ } = await authService.registerUser(req.body);
      // TODO Phase 2: send email verification
      res.status(201).json({ success: true, data: { user }, message: 'Agent registered successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token is required' });
      return;
    }
    const tokens = await authService.refreshAccessToken(refreshToken);
    res.json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logoutUser(req.user!.sub);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  validateBody(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string };
      const result = await authService.requestPasswordReset(email);
      // TODO: trigger email with reset link
      // Always return success to prevent user enumeration
      res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body);
      res.json({ success: true, message: 'Password reset successfully. Please log in.' });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticate,
  validateBody(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
      await authService.changePassword(req.user!.sub, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true, email: true, phone: true,
        firstName: true, lastName: true, role: true,
        status: true, avatarUrl: true, locationTags: true,
        emailVerified: true, notifyOnNewLead: true,
        notifyByEmail: true, lastLoginAt: true, createdAt: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me
router.put(
  '/me',
  authenticate,
  validateBody(profileUpdateSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await authService.updateOwnProfile(req.user!.sub, req.body);
      res.json({ success: true, data: user, message: 'Profile updated' });
    } catch (err) {
      next(err);
    }
  }
);

export { router as authRouter };
