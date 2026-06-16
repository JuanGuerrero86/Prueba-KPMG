import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { env } from './config/env.config';
import { healthRouter } from './health/health.routes';
import { authRouter } from './modules/auth/auth.routes';
import { rolesRouter } from './modules/roles/roles.routes';
import { usersRouter } from './modules/users/users.routes';
import { ticketsRouter } from './modules/tickets/tickets.routes';
import { setupSwagger } from './swagger';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(requestIdMiddleware);

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use('/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/tickets', ticketsRouter);

  setupSwagger(app);

  app.use(errorMiddleware);

  return app;
}
