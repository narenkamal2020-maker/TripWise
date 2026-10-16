import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import * as itineraryService from '../src/services/itinerary';
import * as otm from '../src/services/openTripMap';
import { AppError } from '../src/middleware/errorHandler';
import { config } from '../src/config';

jest.mock('../src/services/itinerary');
jest.mock('../src/services/openTripMap');

const mockGetItinerary = itineraryService.getItinerary as jest.MockedFunction<typeof itineraryService.getItinerary>;
const mockAddToItinerary = itineraryService.addToItinerary as jest.MockedFunction<typeof itineraryService.addToItinerary>;
const mockRemoveFromItinerary = itineraryService.removeFromItinerary as jest.MockedFunction<typeof itineraryService.removeFromItinerary>;
const mockGetPlaceDetail = otm.getPlaceDetail as jest.MockedFunction<typeof otm.getPlaceDetail>;

const TEST_USER_ID = 42;
const TEST_USER_EMAIL = 'test@example.com';

function makeToken(userId = TEST_USER_ID, email = TEST_USER_EMAIL): string {
  return `Bearer ${jwt.sign({ userId, email }, config.JWT_SECRET, { expiresIn: '1h' })}`;
}

const sampleDest = {
  id: 'N1234567',
  name: 'Eiffel Tower',
  kinds: 'cultural',
  latitude: 48.8566,
  longitude: 2.3522,
  source: 'OpenTripMap' as const,
};

const sampleItem = {
  id: 1,
  trip_id: 99,
  xid: 'N1234567',
  snapshot: sampleDest,
  created_at: '2026-10-16T00:00:00.000Z',
};

afterEach(() => jest.clearAllMocks());

/* ── Authentication guard tests ── */
describe('Itinerary authentication', () => {
  it('GET /api/itinerary returns 401 without token', async () => {
    const res = await request(app).get('/api/itinerary');
    expect(res.status).toBe(401);
  });

  it('POST /api/itinerary returns 401 without token', async () => {
    const res = await request(app).post('/api/itinerary').send({ xid: 'N1234567' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/itinerary/:id returns 401 without token', async () => {
    const res = await request(app).delete('/api/itinerary/1');
    expect(res.status).toBe(401);
  });
});

/* ── GET /api/itinerary ── */
describe('GET /api/itinerary', () => {
  it('returns itinerary items for authenticated user', async () => {
    mockGetItinerary.mockResolvedValueOnce([sampleItem]);
    const res = await request(app)
      .get('/api/itinerary')
      .set('Authorization', makeToken());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].xid).toBe('N1234567');
    expect(mockGetItinerary).toHaveBeenCalledWith(TEST_USER_ID);
  });

  it('returns empty array when no items', async () => {
    mockGetItinerary.mockResolvedValueOnce([]);
    const res = await request(app)
      .get('/api/itinerary')
      .set('Authorization', makeToken());
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('different users get separate calls with their own userId', async () => {
    mockGetItinerary.mockResolvedValueOnce([]);
    await request(app).get('/api/itinerary').set('Authorization', makeToken(1, 'a@x.com'));
    expect(mockGetItinerary).toHaveBeenCalledWith(1);

    mockGetItinerary.mockResolvedValueOnce([]);
    await request(app).get('/api/itinerary').set('Authorization', makeToken(2, 'b@x.com'));
    expect(mockGetItinerary).toHaveBeenCalledWith(2);
  });
});

/* ── POST /api/itinerary ── */
describe('POST /api/itinerary', () => {
  it('adds a destination by xid', async () => {
    mockGetPlaceDetail.mockResolvedValueOnce(sampleDest);
    mockAddToItinerary.mockResolvedValueOnce(sampleItem);
    const res = await request(app)
      .post('/api/itinerary')
      .set('Authorization', makeToken())
      .send({ xid: 'N1234567' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.data.xid).toBe('N1234567');
    expect(mockGetPlaceDetail).toHaveBeenCalledWith('N1234567');
    expect(mockAddToItinerary).toHaveBeenCalledWith(TEST_USER_ID, sampleDest);
  });

  it('returns 400 when xid is missing', async () => {
    const res = await request(app)
      .post('/api/itinerary')
      .set('Authorization', makeToken())
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 409 for duplicate item', async () => {
    mockGetPlaceDetail.mockResolvedValueOnce(sampleDest);
    mockAddToItinerary.mockRejectedValueOnce(new AppError(409, 'DUPLICATE_ITEM', 'Already in itinerary'));
    const res = await request(app)
      .post('/api/itinerary')
      .set('Authorization', makeToken())
      .send({ xid: 'N1234567' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_ITEM');
  });

  it('returns 404 when xid does not exist in OTM', async () => {
    mockGetPlaceDetail.mockRejectedValueOnce(new AppError(404, 'NOT_FOUND', 'Place not found'));
    const res = await request(app)
      .post('/api/itinerary')
      .set('Authorization', makeToken())
      .send({ xid: 'INVALID999' });
    expect(res.status).toBe(404);
  });
});

/* ── DELETE /api/itinerary/:id ── */
describe('DELETE /api/itinerary/:id', () => {
  it('removes an itinerary item', async () => {
    mockRemoveFromItinerary.mockResolvedValueOnce(undefined);
    const res = await request(app)
      .delete('/api/itinerary/1')
      .set('Authorization', makeToken());
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockRemoveFromItinerary).toHaveBeenCalledWith(TEST_USER_ID, 1);
  });

  it('returns 404 for non-existent id', async () => {
    mockRemoveFromItinerary.mockRejectedValueOnce(new AppError(404, 'NOT_FOUND', 'Item not found'));
    const res = await request(app)
      .delete('/api/itinerary/9999')
      .set('Authorization', makeToken());
    expect(res.status).toBe(404);
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await request(app)
      .delete('/api/itinerary/abc')
      .set('Authorization', makeToken());
    expect(res.status).toBe(400);
  });
});
