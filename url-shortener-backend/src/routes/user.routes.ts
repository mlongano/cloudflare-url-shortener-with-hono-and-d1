import { Hono } from 'hono';
import { getAllUsers, getProfile } from '../controllers/user.controller';
import { authenticate, jwtAuthenticate } from '../middleware/auth.middleware';

const userRouter = new Hono<{ Bindings: Env }>();

userRouter.get('/', getAllUsers);
userRouter.get('/me',
  jwtAuthenticate(),
  authenticate,
  getProfile);

export default userRouter;