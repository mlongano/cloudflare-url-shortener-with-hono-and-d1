import { Hono } from 'hono';
import { register } from '../controllers/auth.controller';

const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/register', register);

export default authRouter;
