import { setCookie } from 'hono/cookie';
import { Context, MiddlewareHandler } from 'hono';
import { JWTPayload } from '../types';
import { jwt } from 'hono/jwt';

// ==== Middleware ====
export const jwtAuthenticate = (): MiddlewareHandler => {

  return async (c, next) => {

    const jwtMiddleware = jwt({
      secret: c.env.ACCESS_TOKEN_SECRET,
      cookie: c.env.ACCESS_TOKEN_COOKIE_NAME,
    })

    try {
      // Try to authenticate
      await jwtMiddleware(c, async () => {
        // At this point, JWT authentication has succeeded
        // The JWT payload is available as c.get('jwtPayload')
        const payload = c.get('jwtPayload') as JWTPayload;
        const user = {
          id: payload.userId,
          email: payload.email,
        }

        // Set your context property
        c.set('user', user);
      });

    } catch (error) {
      // JWT authentication failed - just continue to the next middleware
      // This will allow authenticate() to try other authentication methods
      console.log('JWT authentication failed, continuing to next middleware');
    }
    // Always continue to the next middleware regardless of JWT result
    return next();

  }
}

// ==== Helper functions ====

// Helper function to set auth cookies
export function setAuthCookies(c: Context, accessToken: string, refreshToken: string) {

  setCookie(c, c.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: parseInt(c.env.REFRESH_TOKEN_EXPIRY)
  });


  setCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: parseInt(c.env.REFRESH_TOKEN_EXPIRY)
  });
}