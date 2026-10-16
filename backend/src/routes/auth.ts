import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import pool from '../db';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({ email: z.string().email() });

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

function signToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

/* POST /api/auth/register */
router.post('/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { name, email, password } = parse.data;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(409).json({ success: false, error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' } });
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name.trim(), email.toLowerCase(), hash],
  );
  const user = rows[0];

  // Create default trip for the new user
  await pool.query('INSERT INTO trips (user_id, name) VALUES ($1, $2)', [user.id, 'My First Trip']);
  // Seed default preferences
  await pool.query('INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

  const token = signToken(user.id, user.email);
  res.status(201).json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
});

/* POST /api/auth/login */
router.post('/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { email, password } = parse.data;

  const { rows } = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = rows[0];
  if (!user) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } });
    return;
  }

  const token = signToken(user.id, user.email);
  res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
});

/* GET /api/auth/me */
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id, name, email, avatar_url, email_verified, created_at FROM users WHERE id = $1', [req.user!.userId]);
  if (!rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }
  res.json({ success: true, data: { user: rows[0] } });
});

/* POST /api/auth/forgot-password */
router.post('/forgot-password', async (req, res) => {
  const parse = forgotSchema.safeParse(req.body);
  if (!parse.success) {
    // Always return neutral response to avoid email enumeration
    res.json({ success: true, data: { message: 'If an account with that email exists, a reset link has been sent.' } });
    return;
  }

  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [parse.data.email.toLowerCase()]);
  // Always return the same response regardless of whether account exists
  if (rows[0]) {
    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [rows[0].id, hash, expires],
    );

    // In production, send email with reset link containing `raw` token.
    // Development: log to console only (never to response).
    if (config.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset token for ${parse.data.email}: ${raw}`);
      console.log(`[DEV] Reset link: ${config.FRONTEND_ORIGIN}/reset-password?token=${raw}`);
    }
  }

  res.json({ success: true, data: { message: 'If an account with that email exists, a reset link has been sent.' } });
});

/* POST /api/auth/reset-password */
router.post('/reset-password', async (req, res) => {
  const parse = resetSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { token, password } = parse.data;

  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const { rows } = await pool.query(
    `SELECT prt.id, prt.user_id FROM password_reset_tokens prt
     WHERE prt.token_hash = $1 AND prt.used_at IS NULL AND prt.expires_at > NOW()`,
    [hash],
  );

  if (!rows[0]) {
    res.status(400).json({ success: false, error: { code: 'TOKEN_INVALID', message: 'This reset link is invalid or has expired.' } });
    return;
  }

  const newHash = await bcrypt.hash(password, 12);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, rows[0].user_id]);
  await pool.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [rows[0].id]);

  res.json({ success: true, data: { message: 'Password updated successfully. You can now log in.' } });
});

/* POST /api/auth/change-password */
router.post('/change-password', requireAuth, async (req, res) => {
  const parse = changePasswordSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { currentPassword, newPassword } = parse.data;
  const { rows } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user!.userId]);
  if (!rows[0]) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
  if (!valid) {
    res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect.' } });
    return;
  }

  const hash = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user!.userId]);
  res.json({ success: true, data: { message: 'Password changed successfully.' } });
});

/* PATCH /api/auth/profile */
router.patch('/profile', requireAuth, async (req, res) => {
  const schema = z.object({ name: z.string().min(2).max(80) });
  const parse = schema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION', message: parse.error.issues[0].message } });
    return;
  }
  const { rows } = await pool.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, avatar_url',
    [parse.data.name.trim(), req.user!.userId],
  );
  res.json({ success: true, data: { user: rows[0] } });
});

/* DELETE /api/auth/account */
router.delete('/account', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.user!.userId]);
  res.json({ success: true, data: { message: 'Account deleted.' } });
});

export default router;
