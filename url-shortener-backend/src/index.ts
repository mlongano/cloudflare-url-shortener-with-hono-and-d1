import { Hono } from 'hono'
import { cors } from 'hono/cors'

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