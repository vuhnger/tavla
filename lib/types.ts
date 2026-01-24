// Data models for departures and weather

export interface Departure {
  line: string;
  destination: string;
  platform: string | null;
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

// API Response types
export interface DeparturesResponse {
  departures: Departure[];
  stationName?: string;
  error?: string;
}

export interface WeatherResponse {
  weather: Weather | null;
  error?: string;
}
