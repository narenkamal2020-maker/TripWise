import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  OPENTRIPMAP_API_KEY: z.string().min(1, 'OPENTRIPMAP_API_KEY is required'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32).default('change-me-to-a-strong-random-secret-at-least-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

function loadConfig() {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Configuration error:\n${missing}`);
  }
  return result.data;
}

export const config = loadConfig();
