/**
 * AUTH SERVICE
 *
 * All authentication business logic lives here.
 * Controllers call these functions — no DB or JWT logic leaks into controllers.
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '@easyliving/database';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { AppError, ConflictError, NotFoundError } from '../../middleware/error.middleware.js';
import type { LoginInput, RegisterInput, ResetPasswordInput } from '@easyliving/shared';

const BCRYPT_ROUNDS = 12;

// ── Token generation ──────────────────────────────────────────────

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export function generateTokenPair(userId: string, email: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { sub: userId, email, role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { sub: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// ── Core auth operations ──────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  // Check for existing email
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  // Check phone if provided
  if (input.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: input.phone },
      select: { id: true },
    });
    if (existingPhone) {
      throw new ConflictError('An account with this phone number already exists');
    }
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const verificationToken = generateSecureToken();

  const user = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role as 'SALES_EXECUTIVE' | 'MARKETING_MANAGER',
      locationTags: input.locationTags as any[] ?? [],
      resetToken: verificationToken, // Reuse field for email verification token
    },
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true, status: true,
    },
  });

  logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

  return { user, verificationToken };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true, email: true, passwordHash: true, firstName: true,
      lastName: true, role: true, status: true, emailVerified: true,
    },
  });

  // Constant-time comparison to prevent user enumeration timing attacks
  const dummyHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6obg9';
  const passwordToCheck = user?.passwordHash ?? dummyHash;
  const isValid = await bcrypt.compare(input.password, passwordToCheck);

  if (!user || !isValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(401, 'Your account has been suspended. Please contact the administrator.');
  }

  // Generate tokens
  const tokens = generateTokenPair(user.id, user.email, user.role);

  // Store refresh token hash for rotation/invalidation
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshTokenHash,
      lastLoginAt: new Date(),
    },
  });

  logger.info('User logged in', { userId: user.id, email: user.email });

  return {
    tokens,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { sub: string };

  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw new AppError(401, 'Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true, email: true, role: true, status: true, refreshTokenHash: true,
    },
  });

  if (!user?.refreshTokenHash) {
    throw new AppError(401, 'Session not found, please log in again');
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError(401, 'Account suspended');
  }

  // Verify the refresh token matches the stored hash
  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    // Token reuse detected — invalidate all sessions
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null },
    });
    logger.warn('Refresh token reuse detected', { userId: user.id });
    throw new AppError(401, 'Security violation detected. Please log in again.', 'TOKEN_REUSE');
  }

  // Issue new token pair (rotation)
  const tokens = generateTokenPair(user.id, user.email, user.role);
  const newRefreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newRefreshTokenHash },
  });

  return tokens;
}

export async function logoutUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshTokenHash: null },
  });
  logger.info('User logged out', { userId });
}

export async function requestPasswordReset(email: string) {
  // Always respond successfully to prevent user enumeration
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });

  if (!user) {
    // Don't reveal whether the email exists
    return { sent: true };
  }

  const resetToken = generateSecureToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: expiry },
  });

  return { sent: true, token: resetToken, userId: user.id };
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: input.token,
      resetTokenExpiry: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(400, 'Reset link is invalid or has expired');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      refreshTokenHash: null, // Force re-login after password reset
    },
  });

  logger.info('Password reset successful', { userId: user.id });
}

export async function updateOwnProfile(
  userId: string,
  input: { firstName?: string; lastName?: string; phone?: string; locationTags?: string[] }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.firstName !== undefined && { firstName: input.firstName }),
      ...(input.lastName !== undefined && { lastName: input.lastName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.locationTags !== undefined && { locationTags: input.locationTags as any[] }),
    },
    select: {
      id: true, email: true, phone: true, firstName: true, lastName: true,
      role: true, status: true, avatarUrl: true, locationTags: true,
    },
  });
  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) throw new NotFoundError('User');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError(400, 'Current password is incorrect');
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash, refreshTokenHash: null },
  });
}
