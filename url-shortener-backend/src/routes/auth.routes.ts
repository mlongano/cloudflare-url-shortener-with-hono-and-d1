import { Hono } from 'hono';
import { login, register } from '../controllers/auth.controller';
import { auth } from 'hono/utils/basic-auth';

const authRouter = new Hono<{ Bindings: Env }>();

authRouter.post('/register', register);
authRouter.post('/login', login);

export default authRouter;
