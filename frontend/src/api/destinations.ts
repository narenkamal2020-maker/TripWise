import { apiClient } from './client';
import type { Destination, DestinationQuery } from '@/types';

export async function searchDestinations(query: DestinationQuery, signal?: AbortSignal): Promise<Destination[]> {
  const params: Record<string, string | number | boolean | undefined | null> = {};
  if (query.q) params.q = query.q;
  if (query.lat !== undefined) params.lat = query.lat;
  if (query.lon !== undefined) params.lon = query.lon;
  if (query.radius !== undefined) params.radius = query.radius;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.kinds) params.kinds = query.kinds;
  if (query.sort) params.sort = query.sort;
  const res = await apiClient.get<Destination[]>('/destinations', params, signal);
  return res.data;
}

export async function getDestination(xid: string, signal?: AbortSignal): Promise<Destination> {
  const res = await apiClient.get<Destination>(`/destinations/${encodeURIComponent(xid)}`, undefined, signal);
  return res.data;
}
