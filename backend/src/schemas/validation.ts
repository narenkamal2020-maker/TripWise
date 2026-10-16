import { z } from 'zod';

export const destinationQuerySchema = z.object({
  q: z.string().min(3, 'Query must be at least 3 characters').optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().int().positive().max(200000).default(5000),
  limit: z.coerce.number().int().positive().max(100).default(20),
  kinds: z.string().optional(),
  sort: z.enum(['distance', 'name', 'rate']).default('distance'),
}).refine(
  (data) => {
    // Need either (lat + lon) for radius search, or q for autosuggest
    const hasCoords = data.lat !== undefined && data.lon !== undefined;
    const hasQuery = data.q !== undefined;
    return hasCoords || hasQuery;
  },
  {
    message: 'Provide coordinates (lat + lon) for nearby search, or q for text search.',
    path: ['lat'],
  },
);

export type DestinationQuery = z.infer<typeof destinationQuerySchema>;

export const xidParamSchema = z.object({
  xid: z.string().min(1, 'xid is required').regex(/^[A-Za-z0-9_]+$/, 'Invalid xid format'),
});

export const addItinerarySchema = z.object({
  xid: z.string().min(1, 'xid is required'),
});

export const itineraryIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
