import { City } from '@/types';

export const POPULAR_CITIES: City[] = [
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393 },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.978 },
];

export const KIND_FILTERS = [
  { value: '', label: 'All Places' },
  { value: 'historic_architecture', label: 'Architecture' },
  { value: 'museums', label: 'Museums' },
  { value: 'religion', label: 'Religious Sites' },
  { value: 'natural', label: 'Nature' },
  { value: 'amusements', label: 'Attractions' },
  { value: 'sport', label: 'Sports' },
  { value: 'foods', label: 'Food & Drink' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'interesting_places', label: 'Points of Interest' },
];
