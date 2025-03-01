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

export default app