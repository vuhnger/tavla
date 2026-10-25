export const STATION = { latitude: 59.9422, longitude: 10.6454 };

export const WEATHER_REFRESH_MS = 10 * 60_000;
export const FORECAST_HOURS = 24;

export const DARK_LIGHT = 0.5;

export const CLOUD_FALLBACK = { clear: 10, partly: 50, overcast: 95 };
export const CLOUD_CLEAR_PCT = 12.5;
export const CLOUD_OVERCAST_PCT = 87.5;

export const SNOW_MM_FACTOR = 2;
export const SNOW_MAX_C = 0;
export const SLEET_MAX_C = 1.5;

export const RAIN_BANDS = [
  { name: 'drizzle', upTo: 0.5, min: 8, max: 20, speed: 1.8, snowSpeed: 0.35, length: 1, alpha: 0.4 },
  { name: 'light', upTo: 2.5, min: 20, max: 50, speed: 2.8, snowSpeed: 0.5, length: 2, alpha: 0.5 },
  { name: 'moderate', upTo: 7.6, min: 50, max: 110, speed: 3.6, snowSpeed: 0.7, length: 3, alpha: 0.6 },
  { name: 'heavy', upTo: 20, min: 110, max: 200, speed: 4.6, snowSpeed: 0.95, length: 4, alpha: 0.7 },
] as const;

export const NOON_HOUR = 12;
export const MORNING_HOUR = 8;
export const AFTERNOON_HOUR = 16;
export const WEATHER_CACHE = 's-maxage=600';
