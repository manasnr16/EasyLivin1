/**
 * ERROR HANDLING & VALIDATION MIDDLEWARE
 *
 * validateBody(schema) — validates req.body against a Zod schema.
 *   Returns 400 with field-level errors if validation fails.
 *   Attaches the parsed (typed) data to req.body.
 *
 * errorHandler — Express global error handler.
 *   Catches any error thrown or passed to next(err).
 *   Returns consistent JSON error responses.
 *   Logs server errors to Winston.
 */

import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * validateBody — middleware factory for Zod schema validation
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors as Record<string, string[]>;
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details,
      });
      return;
    }

    req.body = result.data;
    next();
  };
}

/**
 * validateQuery — middleware factory for Zod query param validation
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const details = result.error.flatten().fieldErrors as Record<string, string[]>;
      res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details,
      });
      return;
    }

    (req as Request & { parsedQuery: T }).parsedQuery = result.data;
    next();
  };
}

/**
 * Custom error class for known application errors
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

/**
 * Global error handler — must have 4 parameters (err, req, res, next)
 * Express identifies it as an error handler by the arity.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Known application error — send to client
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code }),
      ...(err.details !== undefined && { details: err.details }),
    });
    return;
  }

  // Zod error that escaped middleware (shouldn't happen, but safe to catch)
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  // Prisma unique constraint violation
  if ((err as { code?: string }).code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this value already exists',
      code: 'UNIQUE_CONSTRAINT',
    });
    return;
  }

  // Prisma record not found
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Record not found',
    });
    return;
  }

  // Unknown error — log it and hide details from client
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.sub,
  });

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
    // Only expose details in development
    ...(env.NODE_ENV === 'development' && { debug: err.message }),
  });
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
}
