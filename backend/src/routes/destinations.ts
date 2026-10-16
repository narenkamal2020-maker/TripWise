import { Router, Request, Response, NextFunction } from 'express';
import { destinationQuerySchema, xidParamSchema } from '../schemas/validation';
import * as otm from '../services/openTripMap';
import { Destination } from '../types';

const router = Router();

// GET /api/destinations
// Supports: text search (q) or nearby search (lat+lon).
// If q is provided AND coords are present → autosuggest with geo context.
// If only coords → radius search.
// If only q → autosuggest without geo context.
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = destinationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues.map((i) => i.message).join('; '),
        },
      });
      return;
    }

    const { q, lat, lon, radius, limit, kinds, sort } = parsed.data;
    let results: Destination[];

    if (q) {
      // Text search (with optional geo context)
      results = await otm.autosuggest({ q, lat, lon, radius, limit, kinds });
    } else {
      // Nearby search requires coordinates (guaranteed by refine)
      results = await otm.searchNearby({ lat: lat!, lon: lon!, radius, limit, kinds });
    }

    // Sort locally when provider doesn't guarantee order
    if (sort === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'distance') {
      results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    // 'rate' order comes from provider — no local override needed

    res.json({
      success: true,
      data: results,
      meta: {
        source: 'OpenTripMap',
        count: results.length,
        query: { q, lat, lon, radius, limit, kinds, sort },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/destinations/:xid
router.get('/:xid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = xidParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues.map((i) => i.message).join('; '),
        },
      });
      return;
    }

    const destination = await otm.getPlaceDetail(parsed.data.xid);
    res.json({
      success: true,
      data: destination,
      meta: { source: 'OpenTripMap' },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
