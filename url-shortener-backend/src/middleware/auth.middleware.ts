import { Context } from 'hono';
import { setCookie } from 'hono/cookie';

// ==== Helper functions ====

// Helper function to set auth cookies
export function setAuthCookies(c: Context, accessToken: string, refreshToken: string) {
  const env = c.env as Env;
  setCookie(c, env.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: parseInt(env.ACCESS_TOKEN_EXPIRY)
  });

  setCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: parseInt(env.REFRESH_TOKEN_EXPIRY)
  });
}