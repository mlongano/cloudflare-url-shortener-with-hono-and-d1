import { Hono } from 'hono'
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import { corsMiddleware } from './middleware/cors.middleware';

const app = new Hono()

// Use the CORS middleware wrapper
app.use('*', corsMiddleware());

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
api.route('/users', userRouter);

// Mount API under /api/v1
app.route('/api/v1', api);

// Global error handler
app.onError((err, c) => {
  const env = c.env as Env
  console.error(`[ERROR] ${err.message}`, {
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  })

  // Handle database errors
  if (err.message?.includes('UNIQUE constraint failed')) {
    return c.json(
      {
        success: false,
        message: 'Email already in use',
      },
      400,
    )
  }

  // Default error response
  const isDev = env.ENV === 'development'
  return c.json(
    {
      success: false,
      message: 'Unhandled error',
      ...(isDev ? { message: err.message, stack: err.stack } : {}),
    },
    500,
  )
})
export default app