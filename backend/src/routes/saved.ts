import { Router } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const saveSchema = z.object({
  xid: z.string().min(1),
  snapshot: z.record(z.unknown()),
});

/* GET /api/saved */
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, xid, snapshot, created_at FROM saved_places WHERE user_id = $1 ORDER BY created_at DESC',
    [req.user!.userId],
  );
  res.json({ success: true, data: rows });
});

/* POST /api/saved */
router.post('/', async (req, res) => {
  const parse = saveSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { xid, snapshot } = parse.data;

  const existing = await pool.query(
    'SELECT id FROM saved_places WHERE user_id = $1 AND xid = $2',
    [req.user!.userId, xid],
  );
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ success: false, error: { code: 'ALREADY_SAVED', message: 'Destination already saved.' } });
    return;
  }

  const { rows } = await pool.query(
    'INSERT INTO saved_places (user_id, xid, snapshot) VALUES ($1, $2, $3) RETURNING id, xid, snapshot, created_at',
    [req.user!.userId, xid, JSON.stringify(snapshot)],
  );
  res.status(201).json({ success: true, data: rows[0] });
});

/* DELETE /api/saved/:xid */
router.delete('/:xid', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM saved_places WHERE user_id = $1 AND xid = $2',
    [req.user!.userId, req.params.xid],
  );
  if (!result.rowCount) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Saved place not found.' } });
    return;
  }
  res.json({ success: true });
});

export default router;
