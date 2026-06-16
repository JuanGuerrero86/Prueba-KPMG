import dotenv from 'dotenv';
dotenv.config();

function optional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3001'), 10),
  DB: {
    HOST: optional('DB_HOST', 'localhost'),
    PORT: parseInt(optional('DB_PORT', '5432'), 10),
    USER: optional('DB_USER', 'postgres'),
    PASSWORD: optional('DB_PASSWORD', 'postgres'),
    NAME: optional('DB_NAME', 'tickets_db'),
    NAME_TEST: optional('DB_NAME_TEST', 'tickets_test_db'),
  },
  JWT: {
    PRIVATE_KEY_PATH: optional('JWT_PRIVATE_KEY_PATH', './keys/private.pem'),
    PUBLIC_KEY_PATH: optional('JWT_PUBLIC_KEY_PATH', './keys/public.pem'),
    ACCESS_EXPIRES_IN: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    REFRESH_EXPIRES_IN: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  CORS_ORIGIN: optional('CORS_ORIGIN', 'http://localhost:5173'),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
};
