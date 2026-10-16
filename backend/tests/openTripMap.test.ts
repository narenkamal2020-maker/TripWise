import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { _setClient, _resetClient, searchNearby, autosuggest, getPlaceDetail } from '../src/services/openTripMap';
import { AppError } from '../src/middleware/errorHandler';

const mock = new MockAdapter(axios);
const BASE = 'https://api.opentripmap.com/0.1';

// Inject a mocked axios instance
const mockAxios = axios.create({ baseURL: BASE, params: { apikey: 'test_key_12345' } });
const mockAdapter = new MockAdapter(mockAxios);

beforeAll(() => _setClient(mockAxios));
afterAll(() => { _resetClient(); mock.restore(); });
afterEach(() => mockAdapter.reset());

const geoJsonResponse = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'N1',
      geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
      properties: { xid: 'N1234567', name: 'Eiffel Tower', dist: 100, kinds: 'cultural', rate: 3 },
    },
  ],
};

const detailResponse = {
  xid: 'N1234567',
  name: 'Eiffel Tower',
  kinds: 'cultural,architecture',
  point: { lat: 48.8566, lon: 2.3522 },
  address: { city: 'Paris', country: 'France', postcode: '75007' },
  wikipedia_extracts: { text: 'The Eiffel Tower is a wrought-iron lattice tower.' },
  preview: { source: 'https://example.com/eiffel.jpg' },
};

describe('searchNearby', () => {
  it('normalises radius response into Destination array', async () => {
    mockAdapter.onGet('/en/places/radius').reply(200, geoJsonResponse);
    const results = await searchNearby({ lat: 48.8566, lon: 2.3522, radius: 1000, limit: 5 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('N1234567');
    expect(results[0].name).toBe('Eiffel Tower');
    expect(results[0].latitude).toBe(48.8566);
    expect(results[0].source).toBe('OpenTripMap');
  });

  it('returns empty array for empty FeatureCollection', async () => {
    mockAdapter.onGet('/en/places/radius').reply(200, { type: 'FeatureCollection', features: [] });
    const results = await searchNearby({ lat: 48.8566, lon: 2.3522 });
    expect(results).toEqual([]);
  });

  it('throws UPSTREAM_AUTH_ERROR on 401', async () => {
    mockAdapter.onGet('/en/places/radius').reply(401);
    await expect(searchNearby({ lat: 48.8566, lon: 2.3522 })).rejects.toMatchObject({
      code: 'UPSTREAM_AUTH_ERROR',
    });
  });

  it('throws RATE_LIMIT on 429', async () => {
    mockAdapter.onGet('/en/places/radius').reply(429);
    await expect(searchNearby({ lat: 48.8566, lon: 2.3522 })).rejects.toMatchObject({
      code: 'RATE_LIMIT',
    });
  });

  it('throws UPSTREAM_TIMEOUT on timeout', async () => {
    mockAdapter.onGet('/en/places/radius').timeout();
    await expect(searchNearby({ lat: 48.8566, lon: 2.3522 })).rejects.toMatchObject({
      code: 'UPSTREAM_TIMEOUT',
    });
  });

  it('throws UPSTREAM_ERROR on network failure', async () => {
    mockAdapter.onGet('/en/places/radius').networkError();
    await expect(searchNearby({ lat: 48.8566, lon: 2.3522 })).rejects.toThrow();
  });
});

describe('autosuggest', () => {
  const autoSuggestItems = [
    { xid: 'A111', name: 'Arc de Triomphe', kinds: 'cultural', point: { lat: 48.874, lon: 2.295 }, dist: 3000 },
  ];

  it('normalises autosuggest response', async () => {
    mockAdapter.onGet('/en/places/autosuggest').reply(200, autoSuggestItems);
    const results = await autosuggest({ q: 'Arc', lat: 48.8566, lon: 2.3522 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('A111');
    expect(results[0].name).toBe('Arc de Triomphe');
    expect(results[0].distance).toBe(3000);
  });

  it('returns empty array when no matches', async () => {
    mockAdapter.onGet('/en/places/autosuggest').reply(200, []);
    const results = await autosuggest({ q: 'xyznoplacefound' });
    expect(results).toEqual([]);
  });

  it('throws on upstream error', async () => {
    mockAdapter.onGet('/en/places/autosuggest').reply(500);
    await expect(autosuggest({ q: 'Paris' })).rejects.toBeInstanceOf(AppError);
  });
});

describe('getPlaceDetail', () => {
  it('normalises place detail response', async () => {
    mockAdapter.onGet('/en/places/xid/N1234567').reply(200, detailResponse);
    const dest = await getPlaceDetail('N1234567');
    expect(dest.id).toBe('N1234567');
    expect(dest.name).toBe('Eiffel Tower');
    expect(dest.address?.city).toBe('Paris');
    expect(dest.description).toContain('Eiffel Tower');
    expect(dest.image).toBe('https://example.com/eiffel.jpg');
    expect(dest.source).toBe('OpenTripMap');
  });

  it('throws NOT_FOUND for invalid xid', async () => {
    mockAdapter.onGet('/en/places/xid/INVALID').reply(200, {});
    await expect(getPlaceDetail('INVALID')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws NOT_FOUND on 404', async () => {
    mockAdapter.onGet('/en/places/xid/MISSING').reply(404);
    await expect(getPlaceDetail('MISSING')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
