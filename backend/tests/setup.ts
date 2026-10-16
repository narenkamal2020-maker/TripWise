// Set required env vars before any module loads config
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/tripwise_test';
process.env.OPENTRIPMAP_API_KEY = 'test_key_12345';
process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
