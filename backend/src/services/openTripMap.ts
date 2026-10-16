import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import {
  Destination,
  OtmRadiusResponse,
  OtmAutoSuggestItem,
  OtmPlaceDetail,
  OtmGeonameResponse,
} from '../types';

const OTM_BASE = 'https://api.opentripmap.com/0.1';
const DEFAULT_TIMEOUT_MS = 10000;

let _client: AxiosInstance | null = null;

function getClient(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: OTM_BASE,
      timeout: DEFAULT_TIMEOUT_MS,
      params: { apikey: config.OPENTRIPMAP_API_KEY },
    });
  }
  return _client;
}

// Allow tests to inject a custom client (e.g. with axios-mock-adapter)
export function _setClient(client: AxiosInstance): void {
  _client = client;
}

export function _resetClient(): void {
  _client = null;
}

function normaliseAddress(raw: OtmPlaceDetail['address']): Destination['address'] {
  if (!raw) return undefined;
  return {
    city: raw.city || undefined,
    state: raw.state || undefined,
    country: raw.country || undefined,
    postcode: raw.postcode || undefined,
    road: raw.road || undefined,
    house_number: raw.house_number || undefined,
  };
}

function pickImage(detail: OtmPlaceDetail): string | undefined {
  if (detail.preview?.source) return detail.preview.source;
  if (detail.image) return detail.image;
  return undefined;
}

function pickDescription(detail: OtmPlaceDetail): string | undefined {
  if (detail.wikipedia_extracts?.text) return detail.wikipedia_extracts.text.slice(0, 1000);
  if (detail.info?.descr) return detail.info.descr.slice(0, 1000);
  return undefined;
}

function normaliseDetail(detail: OtmPlaceDetail): Destination {
  return {
    id: detail.xid,
    name: detail.name || detail.xid,
    kinds: detail.kinds || '',
    latitude: detail.point?.lat ?? 0,
    longitude: detail.point?.lon ?? 0,
    address: normaliseAddress(detail.address),
    description: pickDescription(detail),
    image: pickImage(detail),
    wikipedia: detail.wikipedia || undefined,
    source: 'OpenTripMap',
  };
}

function handleAxiosError(err: unknown, context: string): never {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ status?: number; error?: string }>;
    const status = axiosErr.response?.status;

    if (status === 401 || status === 403) {
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', 'Invalid or missing OpenTripMap API key.');
    }
    if (status === 429) {
      throw new AppError(429, 'RATE_LIMIT', 'OpenTripMap rate limit exceeded. Try again later.');
    }
    if (status === 404) {
      throw new AppError(404, 'NOT_FOUND', `Resource not found: ${context}`);
    }
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.code === 'ETIMEDOUT') {
      throw new AppError(504, 'UPSTREAM_TIMEOUT', 'OpenTripMap request timed out.');
    }
    throw new AppError(502, 'UPSTREAM_ERROR', `OpenTripMap request failed: ${context}`);
  }
  throw err;
}

// Resolve a city name to coordinates using geoname endpoint
export async function getCityCoordinates(
  name: string,
  country?: string,
): Promise<{ lat: number; lon: number }> {
  const client = getClient();
  try {
    const params: Record<string, unknown> = { name };
    if (country) params.country = country;
    const { data } = await client.get<OtmGeonameResponse>('/en/places/geoname', { params });
    if (typeof data.lat !== 'number' || typeof data.lon !== 'number') {
      throw new AppError(404, 'CITY_NOT_FOUND', `City not found: ${name}`);
    }
    return { lat: data.lat, lon: data.lon };
  } catch (err) {
    handleAxiosError(err, `geoname:${name}`);
  }
}

// Nearby places search using radius endpoint
export async function searchNearby(params: {
  lat: number;
  lon: number;
  radius?: number;
  limit?: number;
  kinds?: string;
}): Promise<Destination[]> {
  const client = getClient();
  const { lat, lon, radius = 5000, limit = 20, kinds } = params;

  try {
    const query: Record<string, unknown> = {
      lat,
      lon,
      radius,
      limit,
      format: 'geojson',
    };
    if (kinds) query.kinds = kinds;

    const { data } = await client.get<OtmRadiusResponse>('/en/places/radius', { params: query });

    if (!data.features || !Array.isArray(data.features)) return [];

    return data.features.map((f) => ({
      id: f.properties.xid,
      name: f.properties.name || f.properties.xid,
      kinds: f.properties.kinds || '',
      latitude: f.geometry.coordinates[1],
      longitude: f.geometry.coordinates[0],
      distance: f.properties.dist !== undefined ? Math.round(f.properties.dist) : undefined,
      source: 'OpenTripMap' as const,
    }));
  } catch (err) {
    handleAxiosError(err, 'radius');
  }
}

// Autosuggest / text search
export async function autosuggest(params: {
  q: string;
  lat?: number;
  lon?: number;
  radius?: number;
  limit?: number;
  kinds?: string;
}): Promise<Destination[]> {
  const client = getClient();
  const { q, lat, lon, radius = 50000, limit = 20, kinds } = params;

  try {
    const query: Record<string, unknown> = { name: q, radius, limit };
    if (lat !== undefined) query.lat = lat;
    if (lon !== undefined) query.lon = lon;
    if (kinds) query.kinds = kinds;

    const { data } = await client.get<OtmAutoSuggestItem[]>('/en/places/autosuggest', {
      params: query,
    });

    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: item.xid,
      name: item.name || item.xid,
      kinds: item.kinds || '',
      latitude: item.point?.lat ?? 0,
      longitude: item.point?.lon ?? 0,
      distance: item.dist !== undefined ? Math.round(item.dist) : undefined,
      source: 'OpenTripMap' as const,
    }));
  } catch (err) {
    handleAxiosError(err, 'autosuggest');
  }
}

// Place details by xid
export async function getPlaceDetail(xid: string): Promise<Destination> {
  const client = getClient();
  try {
    const { data } = await client.get<OtmPlaceDetail>(`/en/places/xid/${xid}`);
    if (!data || !data.xid) {
      throw new AppError(404, 'NOT_FOUND', `Place not found: ${xid}`);
    }
    return normaliseDetail(data);
  } catch (err) {
    handleAxiosError(err, `xid:${xid}`);
  }
}
