import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth.routes';

import { verifyPassword } from './lib/hashAndCompare';
import userRouter from './routes/user.routes';

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
api.route('/users', userRouter);

// Mount API under /api/v1
app.route('/api/v1', api);


export default app