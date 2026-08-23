/**
 * EXPRESS APPLICATION
 *
 * Configures and exports the Express app.
 * Separated from server startup (src/index.ts) so tests can import
 * the app without starting a real HTTP server.
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import * as helmetModule from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import * as rateLimitModule from 'express-rate-limit';

import { env } from './config/env.js';
import { morganStream } from './config/logger.js';
import { Sentry } from './config/sentry.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';
import { propertyRouter } from './routes/property.routes.js';
import { publicPropertyRouter } from './routes/public-property.routes.js';
import {
  leadRouter,
  enquiryRouter,
  uploadRouter,
} from './routes/leads-enquiries-uploads.routes.js';

// helmet and express-rate-limit ship dual CJS/ESM packages whose "exports"
// map doesn't carry a matching `types` condition for the ESM (`import`)
// side — under this repo's tsconfig, tsc resolves their default export as a
// non-callable namespace even though the actual CJS interop Node performs
// at runtime always provides a callable `.default`. `any` here is
// deliberate: casting to the module's own default-export type would just
// inherit that same broken (non-callable) type, so we drop out of the type
// checker entirely for this one handoff rather than relying on the (here,
// unreliable) default-import interop it can't verify.
const helmetModuleAny = helmetModule as any;
const helmet: (options?: Record<string, unknown>) => express.RequestHandler = helmetModuleAny.default ?? helmetModuleAny;
const rateLimitModuleAny = rateLimitModule as any;
const rateLimit: (options?: Record<string, unknown>) => express.RequestHandler = rateLimitModuleAny.default ?? rateLimitModuleAny;

export function createApp() {
  const app = express();

  // ── Security headers ──────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ── CORS ──────────────────────────────────────────────────────
  app.use(cors({
    origin: [env.WEB_URL, env.CRM_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Request parsing ───────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // ── Compression ───────────────────────────────────────────────
  app.use(compression());

  // ── Local media storage ─────────────────────────────────────────
  // Served statically; the helmet CORP config above already allows the
  // website (a different origin) to load these directly in <img> tags.
  app.use('/uploads', express.static(path.resolve(process.cwd(), env.MEDIA_STORAGE_DIR)));

  // ── HTTP logging ──────────────────────────────────────────────
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: morganStream,
    skip: (_req, res) => env.NODE_ENV === 'test' || res.statusCode < 400,
  }));

  // ── Global rate limits ────────────────────────────────────────
  // Stricter limit on auth endpoints to prevent brute force
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, error: 'Too many requests, please try again in 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 200,
    message: { success: false, error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Public, unauthenticated lead-capture form — tightly limited per IP to
  // prevent spam/bot lead injection.
  const enquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { success: false, error: 'Too many enquiries submitted. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
  app.use('/api/enquiries', enquiryLimiter);
  app.use('/api', generalLimiter);

  // ── Health check ──────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  // ── API Routes ────────────────────────────────────────────────
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/properties', propertyRouter);
  app.use('/api/public/properties', publicPropertyRouter);
  app.use('/api/leads', leadRouter);
  app.use('/api/enquiries', enquiryRouter);
  app.use('/api/uploads', uploadRouter);

  // ── 404 & Error handling ──────────────────────────────────────
  // Must be registered AFTER all routes
  app.use(notFoundHandler);
  if (env.SENTRY_DSN) Sentry.setupExpressErrorHandler(app);
  app.use(errorHandler);

  return app;
}
