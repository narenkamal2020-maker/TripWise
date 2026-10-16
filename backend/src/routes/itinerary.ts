import { Router, Request, Response, NextFunction } from 'express';
import { addItinerarySchema, itineraryIdParamSchema } from '../schemas/validation';
import * as itineraryService from '../services/itinerary';
import * as otm from '../services/openTripMap';

const router = Router();

// GET /api/itinerary
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await itineraryService.getItinerary();
    res.json({
      success: true,
      data: items,
      meta: { count: items.length },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/itinerary
// Body: { xid: string }
// Fetches latest details from OTM and persists a snapshot.
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = addItinerarySchema.safeParse(req.body);
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
    const item = await itineraryService.addToItinerary(destination);

    res.status(201).json({
      success: true,
      data: item,
      meta: { source: 'OpenTripMap' },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/itinerary/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = itineraryIdParamSchema.safeParse(req.params);
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

    await itineraryService.removeFromItinerary(parsed.data.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
