import type { DEFAULT_SETTINGS } from './constants/settings';

export type Settings = typeof DEFAULT_SETTINGS;

export interface Stop {
  id: string;
  name: string;
}

export interface Departure {
  time: string;
  destination: string;
  quay: string;
}

export interface WeatherHour {
  time: string;
  temperatureC: number;
  wind: number;
  precipitation: number;
  symbol: string;
}

export interface DeparturesResponse {
  departures: Departure[];
  error?: string;
}

export interface StopsResponse {
  stops: Stop[];
  error?: string;
}

export interface WeatherResponse {
  hours: WeatherHour[];
  error?: string;
}
