import { Router } from 'express';
import { z } from 'zod';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

const prefsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  reduced_motion: z.boolean().optional(),
  default_layout: z.enum(['grid', 'map']).optional(),
  radius_km: z.number().int().min(1).max(500).optional(),
  distance_unit: z.enum(['km', 'mi']).optional(),
  categories: z.array(z.string()).optional(),
});

/* GET /api/preferences */
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user!.userId]);
  if (!rows[0]) {
    // Auto-create defaults if missing
    await pool.query('INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [req.user!.userId]);
    const { rows: fresh } = await pool.query('SELECT * FROM user_preferences WHERE user_id = $1', [req.user!.userId]);
    res.json({ success: true, data: fresh[0] });
    return;
  }
  res.json({ success: true, data: rows[0] });
});

/* PATCH /api/preferences */
router.patch('/', async (req, res) => {
  const parse = prefsSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const updates = parse.data;
  const fields = Object.entries(updates).filter(([, v]) => v !== undefined);
  if (!fields.length) {
    res.status(400).json({ success: false, error: { code: 'EMPTY', message: 'No fields to update.' } });
    return;
  }

  await pool.query('INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [req.user!.userId]);

  const setClauses = fields.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const values = [req.user!.userId, ...fields.map(([, v]) => v)];
  const { rows } = await pool.query(
    `UPDATE user_preferences SET ${setClauses}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
    values,
  );
  res.json({ success: true, data: rows[0] });
});

export default router;
