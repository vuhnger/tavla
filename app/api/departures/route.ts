import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import type { Departure, DeparturesResponse, StopLocation } from '@/lib/types';

const ENTUR_API_URL = 'https://api.entur.io/journey-planner/v3/graphql';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// GraphQL query for fetching departures
const DEPARTURES_QUERY = `
  query GetDepartures($stopPlaceId: String!, $numberOfDepartures: Int!) {
    stopPlace(id: $stopPlaceId) {
      id
      name
      latitude
      longitude
      estimatedCalls(timeRange: 72100, numberOfDepartures: $numberOfDepartures) {
        realtime
        aimedDepartureTime
        expectedDepartureTime
        actualDepartureTime
        destinationDisplay {
          frontText
        }
        quay {
          id
          publicCode
        }
        serviceJourney {
          journeyPattern {
            line {
              id
              name
              publicCode
              transportMode
            }
          }
        }
      }
    }
  }
`;

interface EnturCall {
  realtime: boolean;
  aimedDepartureTime: string;
  expectedDepartureTime?: string;
  actualDepartureTime?: string;
  destinationDisplay: {
    frontText: string;
  };
  quay: {
    id: string;
    publicCode: string | null;
  };
  serviceJourney: {
    journeyPattern: {
      line: {
        id: string;
        name: string;
        publicCode: string;
        transportMode: string;
      };
    };
  };
}

interface EnturResponse {
  data?: {
    stopPlace?: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      estimatedCalls: EnturCall[];
    };
  };
  errors?: Array<{ message: string }>;
}

function calculateMinutesUntil(departureTime: string): number {
  const now = new Date();
  const departure = new Date(departureTime);
  const diffMs = departure.getTime() - now.getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

function filterMetroDepartures(calls: EnturCall[]): EnturCall[] {
  // Filter for metro (T-bane) only
  return calls.filter(call => {
    const transportMode = call.serviceJourney.journeyPattern.line.transportMode;
    return transportMode === 'metro';
  });
}

function determineDirection(destination: string): 'mot sentrum' | 'fra sentrum' {
  const dest = destination.toLowerCase();
  // For T-bane Line 2 at Røa:
  // Ellingsrudåsen = mot sentrum (inbound, toward city center)
  // Østerås = fra sentrum (outbound, away from city center)
  if (dest.includes('ellingsrudåsen') || dest.includes('bergkrystallen') || dest.includes('tøyen')) {
    return 'mot sentrum';
  }
  return 'fra sentrum';
}

function mapDeparture(call: EnturCall): Departure {
  const departureTime = call.actualDepartureTime || call.expectedDepartureTime || call.aimedDepartureTime;
  const destination = call.destinationDisplay.frontText;

  return {
    line: call.serviceJourney.journeyPattern.line.publicCode,
    destination,
    direction: determineDirection(destination),
    time: departureTime,
    minutesUntil: calculateMinutesUntil(departureTime),
    realtime: call.realtime,
  };
}

export async function GET(request: Request) {
  try {
    // Allow overriding stopPlaceId via query parameter
    const { searchParams } = new URL(request.url);
    const stopPlaceId = searchParams.get('stopPlaceId') || env.entur.stopPlaceId;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(ENTUR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ET-Client-Name': env.entur.clientName,
      },
      body: JSON.stringify({
        query: DEPARTURES_QUERY,
        variables: {
          stopPlaceId,
          numberOfDepartures: 20, // Fetch more to ensure we have enough after filtering
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Entur API error: ${response.status} ${response.statusText}`);
      return NextResponse.json<DeparturesResponse>(
        { departures: [], error: 'Failed to fetch departures' },
        { status: 200 } // Return 200 to allow graceful fallback on client
      );
    }

    const data: EnturResponse = await response.json();

    if (data.errors) {
      console.error('Entur GraphQL errors:', data.errors);
      return NextResponse.json<DeparturesResponse>(
        { departures: [], error: 'GraphQL error' },
        { status: 200 }
      );
    }

    if (!data.data?.stopPlace?.estimatedCalls) {
      console.warn('No departure data returned from Entur');
      return NextResponse.json<DeparturesResponse>(
        { departures: [] },
        { status: 200 }
      );
    }

    let calls = data.data.stopPlace.estimatedCalls;

    // Apply filters
    calls = filterMetroDepartures(calls);

    // Map to our data model
    const departures = calls.slice(0, 10).map(mapDeparture);
    const stationName = data.data.stopPlace.name;
    const stopLocation: StopLocation = {
      latitude: data.data.stopPlace.latitude,
      longitude: data.data.stopPlace.longitude,
    };

    return NextResponse.json<DeparturesResponse>(
      { departures, stationName, stopLocation },
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
        console.error('Entur API request timeout');
        return NextResponse.json<DeparturesResponse>(
          { departures: [], error: 'Request timeout' },
          { status: 200 }
        );
      }
      console.error('Entur API error:', error.message);
    } else {
      console.error('Unknown error fetching departures:', error);
    }

    return NextResponse.json<DeparturesResponse>(
      { departures: [], error: 'Internal error' },
      { status: 200 }
    );
  }
}
