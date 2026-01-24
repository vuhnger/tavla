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
    stopPlaceId: getEnvVar('STOP_PLACE_ID', 'NSR:StopPlace:59520'),
  },

  // MET Norway API Configuration
  met: {
    userAgent: getEnvVar('MET_USER_AGENT', 'tavla/1.0 (contact: victor.uhnger@gmail.com)'),
    location: {
      lat: getEnvNumber('WEATHER_LAT', 59.9422),
      lon: getEnvNumber('WEATHER_LON', 10.6454),
      alt: getEnvNumber('WEATHER_ALT', 130),
    },
  },
} as const;
