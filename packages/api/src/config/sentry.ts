/**
 * ERROR TRACKING (Sentry)
 *
 * No-op if SENTRY_DSN isn't configured (e.g. local dev) — everything else
 * that imports this module doesn't need to branch on whether Sentry is on.
 *
 * Must be imported before anything else in index.ts so Sentry's
 * instrumentation wraps every subsequent import.
 */

import * as Sentry from '@sentry/node';
import { env } from './env.js';

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.2 : 0,
  });
}

export { Sentry };
