import { Router } from 'express';
import { AppDataSource } from '../config/database.config';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const uptime = Math.floor(process.uptime());
  try {
    await AppDataSource.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', uptime, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'error', uptime, timestamp: new Date().toISOString() });
  }
});
