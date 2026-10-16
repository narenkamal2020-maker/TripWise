import { Address } from '@/types';

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lon).toFixed(4)}°${lonDir}`;
}

export function formatAddress(address: Address | undefined): string {
  if (!address) return '';
  const parts = [address.city, address.state, address.country].filter(Boolean);
  return parts.join(', ');
}

export function formatDistance(meters: number | undefined): string {
  if (meters === undefined) return '';
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatKinds(kinds: string): string {
  if (!kinds) return 'Point of Interest';
  const primary = kinds.split(',')[0].replace(/_/g, ' ');
  return primary.charAt(0).toUpperCase() + primary.slice(1);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
