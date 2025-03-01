import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { hashPassword } from '../../url-shortener-backend/src/lib/hashAndCompare';

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

// Register user
// POST /api/v1/auth/register
// Request body: { email: string, password: string }
// Response body: { success: boolean, results: any[] } | { success: boolean, message: string }
type RegisterQuery = {
  email: string;
  password: string;
};
app.post('/api/v1/auth/register', async (c) => {
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

});

export default app