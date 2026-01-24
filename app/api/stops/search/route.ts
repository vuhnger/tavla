import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import type { Stop, StopSearchResponse } from '@/lib/types';

const GEOCODER_API_URL = 'https://api.entur.io/geocoder/v1/autocomplete';
const REQUEST_TIMEOUT = 10000; // 10 seconds

interface EnturFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties: {
    id: string;
    name: string;
    locality?: string;
    category?: string[];
  };
}

interface EnturGeocoderResponse {
  features?: EnturFeature[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json<StopSearchResponse>(
        { stops: [] },
        { status: 200 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    let response: Response;
    try {
      // Build geocoder URL with filters for transit stops
      const geocoderUrl = new URL(GEOCODER_API_URL);
      geocoderUrl.searchParams.set('text', query);
      geocoderUrl.searchParams.set('layers', 'venue');
      geocoderUrl.searchParams.set('categories', 'metroStation,onstreetTram,railStation,busStation');
      geocoderUrl.searchParams.set('size', '10');

      response = await fetch(geocoderUrl.toString(), {
        headers: {
          'ET-Client-Name': env.entur.clientName,
        },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      console.error(`Entur Geocoder API error: ${response.status} ${response.statusText}`);
      return NextResponse.json<StopSearchResponse>(
        { stops: [], error: 'Failed to search stops' },
        { status: 200 }
      );
    }

    const data: EnturGeocoderResponse = await response.json();

    if (!data.features) {
      return NextResponse.json<StopSearchResponse>(
        { stops: [] },
        { status: 200 }
      );
    }

    // Map features to Stop objects
    const stops: Stop[] = data.features.map((feature) => {
      const coordinates = feature.geometry?.coordinates;
      const longitude = coordinates?.[0];
      const latitude = coordinates?.[1];

      return {
        id: feature.properties.id,
        name: feature.properties.name,
        locality: feature.properties.locality,
        category: feature.properties.category,
        latitude: typeof latitude === 'number' ? latitude : undefined,
        longitude: typeof longitude === 'number' ? longitude : undefined,
      };
    });

    return NextResponse.json<StopSearchResponse>(
      { stops },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache search results for 5 minutes
        },
      }
    );

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Geocoder API request timeout');
        return NextResponse.json<StopSearchResponse>(
          { stops: [], error: 'Request timeout' },
          { status: 200 }
        );
      }
      console.error('Geocoder API error:', error.message);
    } else {
      console.error('Unknown error searching stops:', error);
    }

    return NextResponse.json<StopSearchResponse>(
      { stops: [], error: 'Internal error' },
      { status: 200 }
    );
  }
}
