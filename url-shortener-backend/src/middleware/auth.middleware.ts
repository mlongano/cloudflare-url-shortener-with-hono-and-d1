import { Context, MiddlewareHandler, Next } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { generateTokens, verifyToken } from '../lib/jwt';
import { AuthUser, AuthUserId, JWTPayload } from '../types';
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
// Helper function to refresh the token
async function refreshTokenFlow(c: Context<{ Bindings: Env, Variables: { user: AuthUserId } }>, next: Next) {

  const refreshToken = getCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME);

  if (!refreshToken) {
    return c.json({
      success: false,
      message: 'Authentication required'
    }, 401);
  }

  const payload = await verifyToken(refreshToken, c.env.REFRESH_TOKEN_SECRET) as JWTPayload | null;

  if (!payload) {
    return c.json({
      success: false,
      message: 'Invalid refresh token'
    }, 401);
  }

  // Verify the refresh token is still valid in the database
  const user = await c.env.DB
    .prepare('SELECT id, email FROM users WHERE id = ? AND refresh_token = ?')
    .bind(payload.userId, refreshToken)
    .first<AuthUser>();

  if (!user) {
    return c.json({
      success: false,
      message: 'Invalid refresh token'
    }, 401);
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
    user.id,
    user.email,
    c.env,
  );

  // Update refresh token in database
  await c.env.DB
    .prepare('UPDATE users SET refresh_token = ? WHERE id = ?')
    .bind(newRefreshToken, user.id)
    .run();

  // Set new cookies
  setAuthCookies(c, accessToken, newRefreshToken);

  // Add user to context
  c.set('user', user);
  await next();
}

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