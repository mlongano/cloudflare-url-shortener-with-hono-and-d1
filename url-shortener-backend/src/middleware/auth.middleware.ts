import { Context, MiddlewareHandler, Next } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { generateTokens, verifyToken } from '../lib/jwt'
import { AuthUser, AuthUserId, JWTPayload } from '../types'
import { jwt } from 'hono/jwt'

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
        const payload = c.get('jwtPayload') as JWTPayload
        const user = {
          id: payload.userId,
          email: payload.email,
        }

        // Set your context property
        c.set('user', user)
      })
    } catch (error) {
      // JWT authentication failed - just continue to the next middleware
      // This will allow authenticate() to try other authentication methods
      console.log('JWT authentication failed, continuing to next middleware')
    }
    // Always continue to the next middleware regardless of JWT result
    return next()
  }
}

export async function authenticate(c: Context<{ Bindings: Env; Variables: { user: AuthUserId } }>, next: Next) {
  // Check if user is already set (possibly from a previous middleware for example jwtAuthenticate)
  if (c.get('user')) {
    // JWT succeeded, but we still need to verify the user in database
    const user = c.get('user')

    // Get user from database to ensure they still exist
    const dbUser = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(user.id).first<AuthUserId>()

    if (!dbUser) {
      return c.json(
        {
          success: false,
          message: 'User not found',
        },
        404,
      )
    }

    // Update user in context with DB data to ensure that email or other future fields are up to date
    c.set('user', dbUser)
    return next()
  }
  // The user is not set, so we need to authenticate

  // Check if the request has an access token in the cookie (this middleware is only for cookie-based auth)
  const accessToken = getCookie(c, c.env.ACCESS_TOKEN_COOKIE_NAME)

  if (!accessToken) {
    return c.json(
      {
        success: false,
        message: 'Authentication required',
      },
      401,
    )
  }

  const payload = (await verifyToken(accessToken, c.env.ACCESS_TOKEN_SECRET)) as JWTPayload | null

  if (!payload) {
    // Access token invalid/expired, try to refresh
    return refreshTokenFlow(c, next)
  }

  // Get user from database to ensure they still exist
  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ?').bind(payload.userId).first<AuthUserId>()

  if (!user) {
    return c.json(
      {
        success: false,
        message: 'User not found',
      },
      404,
    )
  }

  // Add user to context
  c.set('user', user)
  await next()
}

// ==== Helper functions ====
// Helper function to refresh the token
async function refreshTokenFlow(c: Context<{ Bindings: Env; Variables: { user: AuthUserId } }>, next: Next) {
  const refreshToken = getCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME)

  if (!refreshToken) {
    return c.json(
      {
        success: false,
        message: 'Authentication required',
      },
      401,
    )
  }

  const payload = (await verifyToken(refreshToken, c.env.REFRESH_TOKEN_SECRET)) as JWTPayload | null

  if (!payload) {
    return c.json(
      {
        success: false,
        message: 'Invalid refresh token',
      },
      401,
    )
  }

  // Verify the refresh token is still valid in the database
  const user = await c.env.DB.prepare('SELECT id, email FROM users WHERE id = ? AND refresh_token = ?')
    .bind(payload.userId, refreshToken)
    .first<AuthUser>()

  if (!user) {
    return c.json(
      {
        success: false,
        message: 'Invalid refresh token',
      },
      401,
    )
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id, user.email, c.env)

  // Update refresh token in database
  await c.env.DB.prepare('UPDATE users SET refresh_token = ? WHERE id = ?').bind(newRefreshToken, user.id).run()

  // Set new cookies
  setAuthCookies(c, accessToken, newRefreshToken)

  // Add user to context
  c.set('user', user)
  await next()
}

// Helper function to set auth cookies
const BASE_COOKIE_OPTIONS = {
  path: '/',
  secure: true, // Ensures cookie is only sent over HTTPS
  httpOnly: true, // Prevents client-side JavaScript access (XSS protection)
  sameSite: 'Lax' as const, // Provides good CSRF protection for most cases. Use 'as const' for stricter typing.
}

export function setAuthCookies(c: Context, accessToken: string, refreshToken: string) {
  const accessTokenExpiry = parseInt(c.env.ACCESS_TOKEN_EXPIRY, 10)
  const refreshTokenExpiry = parseInt(c.env.REFRESH_TOKEN_EXPIRY, 10)
  // Ensure expiry values are valid numbers
  if (isNaN(accessTokenExpiry) || isNaN(refreshTokenExpiry)) {
    console.error('Invalid token expiry configuration in environment variables.')
    // TODO: Handle error appropriately, maybe throw or return an error response earlier
    return
  }

  setCookie(c, c.env.ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: accessTokenExpiry,
  })

  setCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: refreshTokenExpiry,
  })
  console.log('Auth cookies set.')
}

// Helper function to delete auth cookies
// Hono's `deleteCookie` Helper:
// `deleteCookie(c, name, options)` is a convenience function that constructs
// the necessary `Set-Cookie` header for deletion.
//   *   It sets the cookie value to empty (`""`).
//   *   It sets `Expires=Thu, 01 Jan 1970 00:00:00 GMT` (or `Max-Age=0`).
export function clearAuthCookies(c: Context<{ Bindings: Env }>) {
  deleteCookie(c, c.env.ACCESS_TOKEN_COOKIE_NAME, { ...BASE_COOKIE_OPTIONS })
  deleteCookie(c, c.env.REFRESH_TOKEN_COOKIE_NAME, { ...BASE_COOKIE_OPTIONS })
  console.log('Auth cookies headers set for deletion.')
}
