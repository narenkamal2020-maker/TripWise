export interface Address {
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  road?: string;
  house_number?: string;
}

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

export interface ItineraryItem {
  id: number;
  trip_id: number;
  xid: string;
  snapshot: Destination;
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

export interface DestinationQuery {
  q?: string;
  lat?: number;
  lon?: number;
  radius?: number;
  limit?: number;
  kinds?: string;
  sort?: 'distance' | 'name' | 'rate';
}

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}
