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

export default app