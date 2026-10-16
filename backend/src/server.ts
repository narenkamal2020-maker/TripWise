import { config } from './config';
import app from './app';
import pool from './db';

const PORT = config.PORT;

async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS itinerary_items (
        id         SERIAL PRIMARY KEY,
        trip_id    INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        xid        TEXT NOT NULL,
        snapshot   JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_xid_per_trip UNIQUE (trip_id, xid)
      );

      INSERT INTO trips (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);
  } finally {
    client.release();
  }
}

const server = app.listen(PORT, async () => {
  try {
    await ensureSchema();
    console.log(`TripWise backend listening on port ${PORT} [${config.NODE_ENV}]`);
  } catch (err) {
    console.error('Failed to initialise database schema:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully.');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});

export default server;
