import { Context } from 'hono';
import { AuthUserId } from '../types';

export const getAllUsers = async (c: Context<{ Bindings: Env }>) => {
  const env = c.env as Env;
  const result = await env.DB.prepare(
    `select * from users;`,
  )
    .all();
  if (!result! || !result.success) {
    return c.json({
      success: false,
      results: []
    }, 404);
  }

  return c.json(result.results, 200);
};

export const getProfile = async (c: Context<{ Bindings: Env, Variables: { user: AuthUserId } }>) => {

  const id = 1;

  const results = await c.env.DB.prepare(
    `SELECT * FROM users LEFT OUTER JOIN subscriptions ON users.id = subscriptions.user_id LEFT OUTER JOIN urls ON users.id = urls.user_id WHERE users.id=?;`,
  )
    .bind(id)
    .all();
  if (!results) {
    return c.json({
      success: false,
      results: []
    }, 404);
  }

  return c.json({
    success: true,
    results
  }, 200);
};