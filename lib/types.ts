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
  situations: string[];
}

export interface WeatherHour {
  time: string;
  temperatureC: number;
  wind: number;
  precipitation: number;
  cloud: number;
  symbol: string;
}

export interface Workout {
  date: string;
  title: string;
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

export interface WorkoutResponse {
  workouts: Workout[];
  error?: string;
}

export interface NewsResponse {
  headline: string | null;
}
