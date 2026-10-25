import { minutesToMilliseconds } from 'date-fns';

export const STATION = { latitude: 59.9422, longitude: 10.6454 };

export const WEATHER_REFRESH_MS = minutesToMilliseconds(10);
export const FORECAST_HOURS = 24;

export const DARK_LIGHT = 0.5;

export const NOON_HOUR = 12;
export const MORNING_HOUR = 8;
export const AFTERNOON_HOUR = 16;
export const WEATHER_CACHE = 's-maxage=600';
