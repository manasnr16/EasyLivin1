/**
 * AUTHENTICATION & AUTHORISATION MIDDLEWARE
 *
 * authenticate   – Verifies the JWT access token. Attaches the decoded user
 *                  payload to req.user. Rejects with 401 if missing or invalid.
 *
 * authorize(...roles) – Checks that the authenticated user holds one of the
 *                  allowed roles. Rejects with 403 if not.
 *
 * Usage in routes:
 *   router.get('/admin/users', authenticate, authorize('SUPER_ADMIN', 'CLIENT_ADMIN'), handler)
 *   router.post('/properties', authenticate, authorize('SALES_EXECUTIVE', 'CLIENT_ADMIN'), handler)
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '@easyliving/database';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface JwtPayload {
  sub: string;        // user id (cuid)
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request with our user type
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Extracts the bearer token from the Authorization header.
 * Returns null if not present or malformed.
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

/**
 * authenticate — verifies the access token and attaches req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);

  if (!token) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // Verify the user still exists and is active (catches deleted/suspended accounts)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, status: true, role: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Account not found' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(401).json({ success: false, error: 'Account is suspended or inactive' });
      return;
    }

    // Always use the DB role (not the JWT role) to prevent stale token privilege escalation
    req.user = { ...payload, role: user.role };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, error: 'Session expired', code: 'TOKEN_EXPIRED' });
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }
    logger.error('Unexpected auth error', { error: (err as Error).message });
    res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}

/**
 * authorize(...roles) — factory that returns a middleware checking the user's role
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.sub,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
      });
      return;
    }

    next();
  };
}

/**
 * Convenience role groups for use in route definitions
 */
export const ROLES = {
  ADMIN_ONLY: ['SUPER_ADMIN', 'CLIENT_ADMIN'] as const,
  ALL_STAFF: ['SUPER_ADMIN', 'CLIENT_ADMIN', 'SALES_EXECUTIVE', 'MARKETING_MANAGER'] as const,
  SUPER_ONLY: ['SUPER_ADMIN'] as const,
};

/**
 * Adapts the JWT payload (sub/email/role) attached to req.user into the
 * { id, role } shape services expect. Route handlers pass a full JwtPayload
 * around otherwise, and services would silently read `.id` as undefined.
 */
export function toUserContext(user: JwtPayload): { id: string; role: string } {
  return { id: user.sub, role: user.role };
}
