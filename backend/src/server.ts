import { config } from './config';
import app from './app';
import pool from './db';

const PORT = config.PORT;

async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        avatar_url    TEXT,
        email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        used_at    TIMESTAMPTZ,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        theme          TEXT NOT NULL DEFAULT 'system',
        reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
        default_layout TEXT NOT NULL DEFAULT 'grid',
        radius_km      INTEGER NOT NULL DEFAULT 10,
        distance_unit  TEXT NOT NULL DEFAULT 'km',
        categories     TEXT[] NOT NULL DEFAULT '{}',
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS trips (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name       TEXT NOT NULL DEFAULT 'My Trip',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS itinerary_items (
        id         SERIAL PRIMARY KEY,
        trip_id    INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        xid        TEXT NOT NULL,
        snapshot   JSONB NOT NULL,
        position   INTEGER NOT NULL DEFAULT 0,
        notes      TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_xid_per_trip UNIQUE (trip_id, xid)
      );

      CREATE TABLE IF NOT EXISTS saved_places (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        xid        TEXT NOT NULL,
        snapshot   JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_saved_per_user UNIQUE (user_id, xid)
      );
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
