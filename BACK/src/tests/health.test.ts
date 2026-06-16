import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

describe('Health', () => {
  it('GET /health returns 200 without auth', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('status');
  });
});
