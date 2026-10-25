import {
  SEARCH_CACHE,
  SEARCH_MAX_LENGTH,
  SEARCH_MIN_LENGTH,
  SEARCH_RESULTS,
  STATION_CATEGORIES,
  STOP_ID_PATTERN,
} from '@/lib/constants/departures';
import { STATION } from '@/lib/constants/weather';
import { env } from '@/lib/env';
import { respond } from '@/lib/respond';
import type { Stop, StopsResponse } from '@/lib/types';

const GEOCODER_URL = 'https://api.entur.io/geocoder/v1/autocomplete';
const REQUEST_TIMEOUT = 10_000;

interface GeocoderResponse {
  features?: { properties: Stop }[];
}

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get('q') ?? '').trim();
  if (query.length < SEARCH_MIN_LENGTH || query.length > SEARCH_MAX_LENGTH) return respond<StopsResponse>({ stops: [] });

  const url = new URL(GEOCODER_URL);
  url.search = new URLSearchParams({
    text: query,
    layers: 'venue',
    categories: STATION_CATEGORIES,
    size: String(SEARCH_RESULTS),
    'focus.point.lat': String(STATION.latitude),
    'focus.point.lon': String(STATION.longitude),
  }).toString();

  try {
    const response = await fetch(url, {
      headers: { 'ET-Client-Name': env.entur.clientName },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok) throw new Error(`Entur geocoder responded ${response.status}`);

    const { features = [] }: GeocoderResponse = await response.json();
    const stops = features
      .map(({ properties: { id, name } }) => ({ id, name }))
      .filter((stop) => STOP_ID_PATTERN.test(stop.id));
    return respond<StopsResponse>({ stops }, 200, SEARCH_CACHE);
  } catch (error) {
    console.error('Stop search failed:', error instanceof Error ? error.message : error);
    return respond<StopsResponse>({ stops: [], error: 'Search unavailable' }, 502);
  }
}
