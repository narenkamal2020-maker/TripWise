import { apiClient } from './client';
import type { ItineraryItem } from '@/types';

export async function getItinerary(signal?: AbortSignal): Promise<ItineraryItem[]> {
  const res = await apiClient.get<ItineraryItem[]>('/itinerary', undefined, signal);
  return res.data;
}

export async function addToItinerary(xid: string, signal?: AbortSignal): Promise<ItineraryItem> {
  const res = await apiClient.post<ItineraryItem>('/itinerary', { xid }, signal);
  return res.data;
}

export async function removeFromItinerary(id: number, signal?: AbortSignal): Promise<null> {
  const res = await apiClient.delete<null>(`/itinerary/${id}`, signal);
  return res.data;
}
