import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.routes';

import { verifyPassword } from './lib/hashAndCompare';

const app = new Hono()

app.use('/api/*', cors())

app.get('/', (c) => c.text('Hono!'))

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  })
})

// API routes
const api = new Hono<{ Bindings: Env }>();

// Mount routers
api.route('/auth', authRouter);

// Mount API under /api/v1
app.route('/api/v1', api);

app.get('/api/v1/users', async (c) => {
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
});

type LoginQuery = {
  email: string;
  password: string;
};

app.post('/api/v1/auth/login', async (c) => {
  const { email, password } = await c.req.json<LoginQuery>();
  if (!email || !password) return c.json({
    success: false,
    results: []
  }, 400);
  const query = `SELECT * FROM users WHERE email=?;`;
  const env = c.env as Env;
  try {
    const result = await env.DB
      .prepare(query)
      .bind(email)
      .first<LoginQuery>();
    if (!result) {
      return c.json({
        success: false,
        message: "User not found"
      }, 404);
    }
    if (await verifyPassword(result.password, password)) {
      return c.json({
        success: true,
        result: result
      }, 202);
    } else {
      return c.json({
        success: false,
        message: "Invalid password"
      }, 401);
    }
  } catch (error: any) {
    console.error("Error logging in user: ", error.message);
    return c.json({
      success: false,
      message: error.message || "Internal server error",
    }, 500);
  }
});

export default app