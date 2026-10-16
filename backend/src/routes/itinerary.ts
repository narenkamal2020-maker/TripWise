import { Router, Request, Response, NextFunction } from 'express';
import { addItinerarySchema, itineraryIdParamSchema } from '../schemas/validation';
import * as itineraryService from '../services/itinerary';
import * as otm from '../services/openTripMap';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All itinerary endpoints require authentication
router.use(requireAuth);

// GET /api/itinerary
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await itineraryService.getItinerary(req.user!.userId);
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
    const item = await itineraryService.addToItinerary(req.user!.userId, destination);

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

    await itineraryService.removeFromItinerary(req.user!.userId, parsed.data.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
});

export default router;
