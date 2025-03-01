import { Context } from 'hono';
import { hashPassword } from '../lib/hashAndCompare';

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