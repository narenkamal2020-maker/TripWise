export interface Destination {
  id: string;
  name: string;
  kinds: string;
  latitude: number;
  longitude: number;
  distance?: number;
  address?: Address;
  description?: string;
  image?: string;
  wikipedia?: string;
  source: 'OpenTripMap';
}

export interface Address {
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  house_number?: string;
}

export interface ItineraryItem {
  id: number;
  trip_id: number;
  xid: string;
  snapshot: Destination;
  created_at: string;
}

export interface Trip {
  id: number;
  created_at: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Raw OpenTripMap shapes
export interface OtmRadiusFeature {
  type: 'Feature';
  id: string;
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    xid: string;
    name: string;
    dist?: number;
    rate?: number;
    kinds?: string;
    osm?: string;
    wikidata?: string;
  };
}

export interface OtmRadiusResponse {
  type: 'FeatureCollection';
  features: OtmRadiusFeature[];
}

export interface OtmAutoSuggestItem {
  xid: string;
  name: string;
  dist?: number;
  rate?: number;
  kinds?: string;
  point?: { lon: number; lat: number };
}

export interface OtmPlaceDetail {
  xid: string;
  name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    road?: string;
    house_number?: string;
    country_code?: string;
  };
  kinds?: string;
  sources?: { geometry?: string; attributes?: string[] };
  otm?: string;
  wikipedia?: string;
  image?: string;
  preview?: { source?: string; thumbnail?: string };
  wikipedia_extracts?: { title?: string; text?: string; html?: string };
  point?: { lon: number; lat: number };
  bbox?: { lon_min: number; lat_min: number; lon_max: number; lat_max: number };
  info?: { descr?: string; image?: string; src_id?: number; src?: string };
}

export interface OtmGeonameResponse {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population: number;
  timezone: string;
}
