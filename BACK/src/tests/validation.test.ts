import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Validation', () => {
  it('POST /api/auth/register without email returns 400 VAL-001', async () => {
    const res = await request(app).post('/api/auth/register').send({ password: 'Test123*+', nombre: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBe('VAL-001');
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});
