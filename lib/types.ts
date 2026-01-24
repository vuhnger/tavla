// Data models for departures and weather

export interface Departure {
  line: string;
  destination: string;
  direction: 'mot sentrum' | 'fra sentrum';
  time: string; // ISO 8601 timestamp
  minutesUntil: number;
  realtime: boolean;
}

export interface Weather {
  temperatureC: number;
  symbol: string;
  wind: number | null;
  precipitation: number | null;
  updatedAt: string; // ISO 8601 timestamp
}

// Stop location coordinates
export interface StopLocation {
  latitude: number;
  longitude: number;
}

// API Response types
export interface DeparturesResponse {
  departures: Departure[];
  stationName?: string;
  stopLocation?: StopLocation;
  error?: string;
}

export interface WeatherResponse {
  weather: Weather | null;
  error?: string;
}

// Stop search types
export interface Stop {
  id: string;
  name: string;
  locality?: string;
  category?: string[];
  latitude?: number;
  longitude?: number;
}

export interface StopSearchResponse {
  stops: Stop[];
  error?: string;
}
