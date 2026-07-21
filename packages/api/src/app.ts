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
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { morganStream } from './config/logger.js';
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

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
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
  app.use(errorHandler);

  return app;
}
