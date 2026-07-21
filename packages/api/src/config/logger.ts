/**
 * LOGGER
 *
 * Uses Winston for structured JSON logging in production
 * and pretty-printed colored logs in development.
 *
 * Usage:
 *   import { logger } from './logger';
 *   logger.info('Server started', { port: 4000 });
 *   logger.error('Database error', { error: err.message });
 */

import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}] ${message}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: env.NODE_ENV === 'development' ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console(),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Stream for Morgan HTTP request logging
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
