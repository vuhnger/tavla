import { REQUEST_TIMEOUT_MS } from '@/lib/constants/http';
import { CLOUD_FALLBACK, FORECAST_HOURS, WEATHER_CACHE } from '@/lib/constants/weather';
import { env } from '@/lib/env';
import { respond } from '@/lib/respond';
import type { WeatherHour, WeatherResponse } from '@/lib/types';
import { skyOf } from '@/lib/weather/forecast';

const FALLBACK_TTL = 10 * 60_000;

interface METTimeseries {
  time: string;
  data: {
    instant: { details: { air_temperature?: number; wind_speed?: number; cloud_area_fraction?: number } };
    next_1_hours?: { summary: { symbol_code: string }; details: { precipitation_amount?: number } };
  };
}

interface METResponse {
  properties?: { timeseries?: METTimeseries[] };
}

let cache: { hours: WeatherHour[]; expires: number; lastModified: string | null } | null = null;

const { lat, lon, alt } = env.met.location;
const MET_URL = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&altitude=${alt}`;

function parseHours(data: METResponse): WeatherHour[] {
  return (data.properties?.timeseries ?? [])
    .filter((entry) => entry.data.next_1_hours && entry.data.instant.details.air_temperature !== undefined)
    .slice(0, FORECAST_HOURS)
    .map((entry) => ({
      time: entry.time,
      temperatureC: entry.data.instant.details.air_temperature!,
      wind: entry.data.instant.details.wind_speed ?? 0,
      precipitation: entry.data.next_1_hours!.details.precipitation_amount ?? 0,
      cloud: entry.data.instant.details.cloud_area_fraction ?? CLOUD_FALLBACK[skyOf(entry.data.next_1_hours!.summary.symbol_code)],
      symbol: entry.data.next_1_hours!.summary.symbol_code,
    }));
}

const expiresFrom = (headers: Headers) => {
  const expires = Date.parse(headers.get('Expires') ?? '');
  return Number.isNaN(expires) ? Date.now() + FALLBACK_TTL : expires;
};

export async function GET() {
  if (cache && cache.expires > Date.now()) return respond<WeatherResponse>({ hours: cache.hours }, 200, WEATHER_CACHE);

  try {
    const headers: HeadersInit = { 'User-Agent': env.met.userAgent };
    if (cache?.lastModified) headers['If-Modified-Since'] = cache.lastModified;

    const response = await fetch(MET_URL, { headers, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

    if (response.status === 304 && cache) {
      cache.expires = expiresFrom(response.headers);
      return respond<WeatherResponse>({ hours: cache.hours }, 200, WEATHER_CACHE);
    }
    if (!response.ok) throw new Error(`MET responded ${response.status}`);

    const hours = parseHours(await response.json());
    if (hours.length === 0) throw new Error('MET returned no hourly data');

    cache = { hours, expires: expiresFrom(response.headers), lastModified: response.headers.get('Last-Modified') };
    return respond<WeatherResponse>({ hours }, 200, WEATHER_CACHE);
  } catch (error) {
    console.error('Weather fetch failed:', error instanceof Error ? error.message : error);
    return respond<WeatherResponse>({ hours: cache?.hours ?? [], error: 'Weather unavailable' }, cache ? 200 : 502);
  }
}
