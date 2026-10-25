import { STATION } from './constants/weather';

// Environment variable validation and configuration
// All environment variables are loaded server-side only for security

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number, got: ${value}`);
  }
  return num;
}

export const env = {
  // Entur API Configuration
  entur: {
    clientName: getEnvVar('ENTUR_CLIENT_NAME', 'vuhnger-tavla'),
  },

  // MET Norway API Configuration
  met: {
    userAgent: getEnvVar('MET_USER_AGENT', 'tavla/1.0 (contact: victor.uhnger@gmail.com)'),
    location: {
      lat: getEnvNumber('WEATHER_LAT', STATION.latitude),
      lon: getEnvNumber('WEATHER_LON', STATION.longitude),
      alt: getEnvNumber('WEATHER_ALT', 130),
    },
  },
  garmin: {
    icalUrl: getEnvVar('GARMIN_ICAL_URL', ''),
  },

  pairKey: getEnvVar('TAVLA_PAIR_KEY', ''),
} as const;
