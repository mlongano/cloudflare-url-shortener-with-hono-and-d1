import { Hono } from 'hono';
import { getAllUsers } from '../controllers/user.controller';

const userRouter = new Hono<{ Bindings: Env }>();

userRouter.get('/', getAllUsers);

export default userRouter;