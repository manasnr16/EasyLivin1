/**
 * Prisma Client Singleton
 *
 * In Next.js development, hot module reloading causes this file to be
 * re-evaluated on every change, which would create a new PrismaClient
 * instance each time and exhaust the database connection pool.
 *
 * This pattern stores the client on the global object in development
 * so only one instance ever exists. In production, a single module
 * instance is created and reused.
 */
import { PrismaClient } from './generated/index.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env['NODE_ENV'] === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from './generated/index.js';
