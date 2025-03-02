import { Context } from 'hono';
import { setCookie } from 'hono/cookie';

// ==== Helper functions ====

// Helper function to set auth cookies
export function setAuthCookies(c: Context, accessToken: string, refreshToken: string) {
  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: c.env.ACCESS_TOKEN_MAX_AGE
  });

  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: c.env.REFRESH_TOKEN_MAX_AGE
  });
}