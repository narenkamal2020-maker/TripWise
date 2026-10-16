import request from 'supertest';
import app from '../src/app';
import * as otm from '../src/services/openTripMap';

jest.mock('../src/services/openTripMap');

const mockSearchNearby = otm.searchNearby as jest.MockedFunction<typeof otm.searchNearby>;
const mockAutoSuggest = otm.autosuggest as jest.MockedFunction<typeof otm.autosuggest>;
const mockGetPlaceDetail = otm.getPlaceDetail as jest.MockedFunction<typeof otm.getPlaceDetail>;

const sampleDest = {
  id: 'N1234567',
  name: 'Eiffel Tower',
  kinds: 'cultural',
  latitude: 48.8566,
  longitude: 2.3522,
  distance: 100,
  source: 'OpenTripMap' as const,
};

afterEach(() => jest.clearAllMocks());

describe('GET /api/destinations - validation', () => {
  it('returns 400 when neither q nor lat/lon supplied', async () => {
    const res = await request(app).get('/api/destinations');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when only lat is provided (missing lon)', async () => {
    const res = await request(app).get('/api/destinations?lat=48.8566');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when q is too short', async () => {
    const res = await request(app).get('/api/destinations?q=ab');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/destinations - nearby search', () => {
  it('calls searchNearby and returns results', async () => {
    mockSearchNearby.mockResolvedValueOnce([sampleDest]);
    const res = await request(app).get('/api/destinations?lat=48.8566&lon=2.3522&radius=1000');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe('N1234567');
    expect(mockSearchNearby).toHaveBeenCalled();
    expect(mockAutoSuggest).not.toHaveBeenCalled();
  });

  it('returns empty array when no results', async () => {
    mockSearchNearby.mockResolvedValueOnce([]);
    const res = await request(app).get('/api/destinations?lat=0&lon=0');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/destinations - text search', () => {
  it('calls autosuggest for text query', async () => {
    mockAutoSuggest.mockResolvedValueOnce([sampleDest]);
    const res = await request(app).get('/api/destinations?q=Eiffel');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(mockAutoSuggest).toHaveBeenCalled();
    expect(mockSearchNearby).not.toHaveBeenCalled();
  });
});

describe('GET /api/destinations - sort', () => {
  it('sorts by name when sort=name', async () => {
    mockSearchNearby.mockResolvedValueOnce([
      { ...sampleDest, id: 'B', name: 'Zara' },
      { ...sampleDest, id: 'A', name: 'Arc' },
    ]);
    const res = await request(app).get('/api/destinations?lat=0&lon=0&sort=name');
    expect(res.body.data[0].name).toBe('Arc');
    expect(res.body.data[1].name).toBe('Zara');
  });
});

describe('GET /api/destinations/:xid', () => {
  it('returns destination detail', async () => {
    mockGetPlaceDetail.mockResolvedValueOnce({ ...sampleDest, description: 'Famous tower.' });
    const res = await request(app).get('/api/destinations/N1234567');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('N1234567');
  });

  it('returns 404 for unknown xid', async () => {
    const { AppError } = await import('../src/middleware/errorHandler');
    mockGetPlaceDetail.mockRejectedValueOnce(new AppError(404, 'NOT_FOUND', 'Not found'));
    const res = await request(app).get('/api/destinations/UNKNOWN99');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 400 for invalid xid format', async () => {
    const res = await request(app).get('/api/destinations/bad xid!');
    expect(res.status).toBe(400);
  });
});
