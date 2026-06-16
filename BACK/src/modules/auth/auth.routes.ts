import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { RegisterDto, LoginDto } from './auth.dto';

export const authRouter = Router();

authRouter.post('/register', validate(RegisterDto), (req, res, next) =>
  authController.register(req, res).catch(next),
);
authRouter.post('/login', validate(LoginDto), (req, res, next) =>
  authController.login(req, res).catch(next),
);
authRouter.post('/refresh', (req, res, next) => authController.refresh(req, res).catch(next));
authRouter.post('/logout', authMiddleware, (req, res, next) =>
  authController.logout(req, res).catch(next),
);
authRouter.get('/me', authMiddleware, (req, res, next) =>
  authController.me(req, res).catch(next),
);
