import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';

/**
 * Creates a CORS middleware configured using environment variables
 */
export const corsMiddleware = (): MiddlewareHandler => {
  return (c, next) => {
    // Get origins from environment
    const origins = c.env.ALLOWED_ORIGINS;
    if (!Array.isArray(origins)) {
      throw new Error('ALLOWED_ORIGINS must be an array');
    }

    console.log('Allowed Origins: ', c.env.ALLOWED_ORIGINS);

    // Create cors middleware with the parsed origins
    const middleware = cors({
      origin: origins,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      exposeHeaders: ['Content-Encoding', 'Kuma-Revision'],
      credentials: true,
    });

    return middleware(c, next);
  };
};
