/**
 * AUTH COOKIE HELPERS
 *
 * Access/refresh tokens are set as httpOnly, Secure (in production),
 * SameSite=Strict cookies instead of being returned in the JSON body —
 * client-side JS (and therefore XSS) never has access to the raw tokens.
 */

import type { Response } from 'express';
import { env } from '../config/env.js';

export const ACCESS_COOKIE = 'crm_access_token';
export const REFRESH_COOKIE = 'crm_refresh_token';

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  };
}

export function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie(ACCESS_COOKIE, tokens.accessToken, { ...baseCookieOptions(), maxAge: ACCESS_MAX_AGE_MS });
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, { ...baseCookieOptions(), maxAge: REFRESH_MAX_AGE_MS });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, baseCookieOptions());
  res.clearCookie(REFRESH_COOKIE, baseCookieOptions());
}
