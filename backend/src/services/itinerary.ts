import pool from '../db';
import { AppError } from '../middleware/errorHandler';
import { Destination, ItineraryItem } from '../types';

const DEFAULT_TRIP_ID = 1;

export async function ensureDefaultTrip(): Promise<void> {
  await pool.query(
    'INSERT INTO trips (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
    [DEFAULT_TRIP_ID],
  );
}

export async function getItinerary(): Promise<ItineraryItem[]> {
  const result = await pool.query<ItineraryItem>(
    `SELECT id, trip_id, xid, snapshot, created_at
     FROM itinerary_items
     WHERE trip_id = $1
     ORDER BY created_at ASC`,
    [DEFAULT_TRIP_ID],
  );
  return result.rows;
}

export async function addToItinerary(destination: Destination): Promise<ItineraryItem> {
  await ensureDefaultTrip();
  try {
    const result = await pool.query<ItineraryItem>(
      `INSERT INTO itinerary_items (trip_id, xid, snapshot)
       VALUES ($1, $2, $3)
       ON CONFLICT (trip_id, xid) DO NOTHING
       RETURNING id, trip_id, xid, snapshot, created_at`,
      [DEFAULT_TRIP_ID, destination.id, JSON.stringify(destination)],
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

export async function removeFromItinerary(id: number): Promise<void> {
  const result = await pool.query(
    'DELETE FROM itinerary_items WHERE id = $1 AND trip_id = $2',
    [id, DEFAULT_TRIP_ID],
  );
  if (result.rowCount === 0) {
    throw new AppError(404, 'NOT_FOUND', `Itinerary item ${id} not found.`);
  }
}
