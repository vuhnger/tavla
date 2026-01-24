import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import type { Weather, WeatherResponse } from '@/lib/types';

const REQUEST_TIMEOUT = 10000; // 10 seconds

// Simple in-memory cache for weather data
interface CachedWeather {
  data: Weather;
  expires: Date;
  lastModified: string;
  etag?: string;
  lat: number;
  lon: number;
}

let weatherCache: CachedWeather | null = null;

interface METTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature?: number;
        wind_speed?: number;
      };
    };
    next_1_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount?: number;
      };
    };
    next_6_hours?: {
      summary: {
        symbol_code: string;
      };
      details: {
        precipitation_amount?: number;
      };
    };
  };
}

interface METResponse {
  properties?: {
    meta?: {
      updated_at: string;
    };
    timeseries?: METTimeseries[];
  };
}

function buildWeatherUrl(lat?: number, lon?: number): string {
  // Use provided coordinates or fall back to env defaults
  const latitude = lat ?? env.met.location.lat;
  const longitude = lon ?? env.met.location.lon;
  const alt = env.met.location.alt;

  // Use max 4 decimal places as recommended by MET
  const latRounded = latitude.toFixed(4);
  const lonRounded = longitude.toFixed(4);
  return `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latRounded}&lon=${lonRounded}&altitude=${alt}`;
}

function parseWeatherData(data: METResponse): Weather | null {
  if (!data.properties?.timeseries || data.properties.timeseries.length === 0) {
    return null;
  }

  // Use the first (current) timeseries entry
  const current = data.properties.timeseries[0];
  const instant = current.data.instant.details;

  // Try next_1_hours first, fall back to next_6_hours
  const forecast = current.data.next_1_hours || current.data.next_6_hours;

  if (!instant.air_temperature) {
    return null;
  }

  return {
    temperatureC: instant.air_temperature,
    symbol: forecast?.summary.symbol_code || 'unknown',
    wind: instant.wind_speed ?? null,
    precipitation: forecast?.details.precipitation_amount ?? null,
    updatedAt: data.properties.meta?.updated_at || new Date().toISOString(),
  };
}

function parseCacheHeaders(headers: Headers): { expires: Date | null; lastModified: string | null; etag: string | null } {
  const expiresHeader = headers.get('Expires');
  const lastModifiedHeader = headers.get('Last-Modified');
  const etagHeader = headers.get('ETag');

  let expires: Date | null = null;
  if (expiresHeader) {
    const expiresDate = new Date(expiresHeader);
    if (!isNaN(expiresDate.getTime())) {
      expires = expiresDate;
    }
  }

  return {
    expires,
    lastModified: lastModifiedHeader,
    etag: etagHeader,
  };
}

export async function GET(request: Request) {
  // Allow overriding coordinates via query parameters
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : env.met.location.lat;
  const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : env.met.location.lon;

  try {
    const now = new Date();

    // Check if cache is still valid and for the same location
    if (weatherCache && weatherCache.expires > now &&
        weatherCache.lat === lat && weatherCache.lon === lon) {
      console.log('Using cached weather data');
      return NextResponse.json<WeatherResponse>(
        { weather: weatherCache.data },
        { status: 200 }
      );
    }

    // Build request with conditional headers if we have cache for same location
    const headers: HeadersInit = {
      'User-Agent': env.met.userAgent,
    };

    const cacheIsForSameLocation = weatherCache?.lat === lat && weatherCache?.lon === lon;

    if (cacheIsForSameLocation && weatherCache?.lastModified) {
      headers['If-Modified-Since'] = weatherCache.lastModified;
    }

    if (cacheIsForSameLocation && weatherCache?.etag) {
      headers['If-None-Match'] = weatherCache.etag;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(buildWeatherUrl(lat, lon), {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 304 Not Modified (only if cache is for same location)
    if (response.status === 304) {
      console.log('Weather data not modified (304), extending cache');
      if (weatherCache && cacheIsForSameLocation) {
        // Extend cache expiry
        const cacheHeaders = parseCacheHeaders(response.headers);
        if (cacheHeaders.expires) {
          weatherCache.expires = cacheHeaders.expires;
        } else {
          // Default to 10 minutes if no Expires header
          weatherCache.expires = new Date(now.getTime() + 10 * 60 * 1000);
        }
        return NextResponse.json<WeatherResponse>(
          { weather: weatherCache.data },
          { status: 200 }
        );
      }
    }

    if (!response.ok) {
      console.error(`MET API error: ${response.status} ${response.statusText}`);

      // Return cached data if available and for same location, even if expired
      if (weatherCache && cacheIsForSameLocation) {
        console.log('Using stale cache due to API error');
        return NextResponse.json<WeatherResponse>(
          { weather: weatherCache.data },
          { status: 200 }
        );
      }

      return NextResponse.json<WeatherResponse>(
        { weather: null, error: 'Failed to fetch weather' },
        { status: 200 }
      );
    }

    const data: METResponse = await response.json();
    const weather = parseWeatherData(data);

    if (!weather) {
      console.warn('Failed to parse weather data');

      // Return cached data if available and for same location
      if (weatherCache && cacheIsForSameLocation) {
        return NextResponse.json<WeatherResponse>(
          { weather: weatherCache.data },
          { status: 200 }
        );
      }

      return NextResponse.json<WeatherResponse>(
        { weather: null, error: 'Invalid weather data' },
        { status: 200 }
      );
    }

    // Update cache
    const cacheHeaders = parseCacheHeaders(response.headers);
    weatherCache = {
      data: weather,
      expires: cacheHeaders.expires || new Date(now.getTime() + 10 * 60 * 1000), // Default 10 min
      lastModified: cacheHeaders.lastModified || new Date().toUTCString(),
      etag: cacheHeaders.etag || undefined,
      lat,
      lon,
    };

    console.log(`Weather data cached until ${weatherCache.expires.toISOString()} for location ${lat},${lon}`);

    return NextResponse.json<WeatherResponse>(
      { weather },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('MET API request timeout');
      } else {
        console.error('MET API error:', error.message);
      }
    } else {
      console.error('Unknown error fetching weather:', error);
    }

    // Return cached data if available and for same location
    if (weatherCache && weatherCache.lat === lat && weatherCache.lon === lon) {
      console.log('Using stale cache due to error');
      return NextResponse.json<WeatherResponse>(
        { weather: weatherCache.data },
        { status: 200 }
      );
    }

    return NextResponse.json<WeatherResponse>(
      { weather: null, error: 'Internal error' },
      { status: 200 }
    );
  }
}
