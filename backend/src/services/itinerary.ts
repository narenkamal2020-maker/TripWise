import pool from '../db';
import { AppError } from '../middleware/errorHandler';
import { Destination, ItineraryItem } from '../types';

async function getUserTripId(userId: number): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    'SELECT id FROM trips WHERE user_id = $1 ORDER BY created_at ASC LIMIT 1',
    [userId],
  );
  if (rows[0]) return rows[0].id;

  // Create a trip on demand if somehow missing (edge case after account migration)
  const { rows: created } = await pool.query<{ id: number }>(
    "INSERT INTO trips (user_id, name) VALUES ($1, 'My First Trip') RETURNING id",
    [userId],
  );
  return created[0].id;
}

export async function getItinerary(userId: number): Promise<ItineraryItem[]> {
  const tripId = await getUserTripId(userId);
  const result = await pool.query<ItineraryItem>(
    `SELECT id, trip_id, xid, snapshot, created_at
     FROM itinerary_items
     WHERE trip_id = $1
     ORDER BY created_at ASC`,
    [tripId],
  );
  return result.rows;
}

export async function addToItinerary(userId: number, destination: Destination): Promise<ItineraryItem> {
  const tripId = await getUserTripId(userId);
  try {
    const result = await pool.query<ItineraryItem>(
      `INSERT INTO itinerary_items (trip_id, xid, snapshot)
       VALUES ($1, $2, $3)
       ON CONFLICT (trip_id, xid) DO NOTHING
       RETURNING id, trip_id, xid, snapshot, created_at`,
      [tripId, destination.id, JSON.stringify(destination)],
    );
    if (result.rows.length === 0) {
      throw new AppError(409, 'DUPLICATE_ITEM', 'Destination already in itinerary.');
    }
    return result.rows[0];
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(500, 'DB_ERROR', 'Failed to add destination to itinerary.');
  }
}

export async function removeFromItinerary(userId: number, id: number): Promise<void> {
  const tripId = await getUserTripId(userId);
  const result = await pool.query(
    'DELETE FROM itinerary_items WHERE id = $1 AND trip_id = $2',
    [id, tripId],
  );
  if (result.rowCount === 0) {
    throw new AppError(404, 'NOT_FOUND', `Itinerary item ${id} not found.`);
  }
}
