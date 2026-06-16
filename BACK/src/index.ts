import 'reflect-metadata';
import { createApp } from './app';
import { AppDataSource } from './config/database.config';
import { loadJwtKeys } from './config/jwt.config';
import { env } from './config/env.config';
import { createLogger } from './shared/logger/logger';

const logger = createLogger('Server');

async function bootstrap() {
  loadJwtKeys();
  await AppDataSource.initialize();
  logger.info('Database connected');

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
});
