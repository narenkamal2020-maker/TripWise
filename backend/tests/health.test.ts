import request from 'supertest';
import app from '../src/app';
import pool from '../src/db';

jest.mock('../src/db', () => {
  const mockQuery = jest.fn().mockResolvedValue({ rows: [] });
  return {
    __esModule: true,
    default: { query: mockQuery },
  };
});

describe('GET /api/health', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns healthy when DB is reachable', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.data.db).toBe('ok');
  });

  it('returns degraded when DB is unreachable', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.data.status).toBe('degraded');
  });
});
