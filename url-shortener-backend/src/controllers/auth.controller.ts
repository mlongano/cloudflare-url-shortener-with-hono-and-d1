import { Context } from 'hono';
import { hashPassword, verifyPassword } from '../lib/hashAndCompare';
import { generateTokens } from '../lib/jwt';
import { AuthUser } from '../types';
import { setAuthCookies } from '../middleware/auth.middleware';

// Register user
// POST /api/v1/auth/register
// Request body: { email: string, password: string }
// Response body: { success: boolean, results: any[] } | { success: boolean, message: string }
type RegisterQuery = {
  email: string;
  password: string;
};

export const register = async (c: Context<{ Bindings: Env }>) => {
  const { email, password } = await c.req.json<RegisterQuery>();

  // Check payload
  if (!email || !password) return c.json({
    success: false,
    results: []
  }, 400);

  const query = `
      INSERT INTO users (email, password)
      VALUES (?, ?)`;

  const env = c.env as Env;

  // Register user
  try {
    const hash = await hashPassword(password);
    const results = await env.DB
      .prepare(query)
      .bind(email, hash)
      .run();
    return c.json({
      success: true,
      results: results
    }, 201);
  } catch (error: any) {
    // Handle error if registration fails
    console.error("Error registring user: ", error.message);
    return c.json({
      success: false,
      message: error.message || "Internal server error",
    }, 500);
  }

};

type LoginQuery = {
  email: string;
  password: string;
};

export const login = async (c: Context<{ Bindings: Env }>) => {
  const { email, password } = await c.req.json<LoginQuery>();
  if (!email || !password) return c.json({
    success: false,
    results: []
  }, 400);
  const query = `SELECT * FROM users WHERE email=?;`;
  const env = c.env as Env;
  try {
    const user = await env.DB
      .prepare(query)
      .bind(email)
      .first<AuthUser>();
    if (!user) {
      return c.json({
        success: false,
        message: "User not found"
      }, 404);
    }
    // Check password and generate tokens
    if (await verifyPassword(user.password, password)) {
      // Generate tokens
      const { accessToken, refreshToken } = await generateTokens(
        user.id,
        user.email,
        c.env
      );

      // Store refresh token in database
      await c.env.DB
        .prepare('UPDATE users SET refresh_token = ? WHERE id = ?')
        .bind(refreshToken, user.id)
        .run();

      // Set cookies
      setAuthCookies(c, accessToken, refreshToken);

      // Return user data in successful response
      return c.json({
        success: true,
        result: {
          id: user.id,
          email: user.email
        },
      }, 202);
    } else {
      // Return error if the check of password fails
      return c.json({
        success: false,
        message: "Invalid password"
      }, 401);
    }
  } catch (error: any) {
    // Handle error of DB queries and password verification promises
    console.error("Error logging in user: ", error.message);
    return c.json({
      success: false,
      message: error.message || "Internal server error",
    }, 500);
  }
};