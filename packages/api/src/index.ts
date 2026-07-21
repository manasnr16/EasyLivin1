/**
 * SERVER ENTRY POINT
 *
 * Starts the HTTP server after connecting to the database.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from '@easyliving/database';

async function main() {
  // Verify database connection before starting
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error('Database connection failed', { error: (err as Error).message });
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`API server started`, {
      port: env.PORT,
      env: env.NODE_ENV,
      webUrl: env.WEB_URL,
      crmUrl: env.CRM_URL,
    });
  });

  // ── Graceful shutdown ─────────────────────────────────────────
  async function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });

    // Force shutdown after 10 seconds if graceful fails
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

main();
