import { DEPARTURE_COUNT, RAIL_MODES, STOP_ID_PATTERN } from '@/lib/constants/departures';
import { env } from '@/lib/env';
import { respond } from '@/lib/respond';
import type { Departure, DeparturesResponse } from '@/lib/types';

const ENTUR_URL = 'https://api.entur.io/journey-planner/v3/graphql';
const REQUEST_TIMEOUT = 10_000;
const TIME_RANGE_SECONDS = 72_100;

const QUERY = `
  query ($id: String!, $count: Int!, $range: Int!, $modes: [TransportMode]) {
    stopPlace(id: $id) {
      estimatedCalls(timeRange: $range, numberOfDepartures: $count, whiteListedModes: $modes) {
        aimedDepartureTime
        expectedDepartureTime
        destinationDisplay { frontText }
        quay { id }
      }
    }
  }
`;

interface EnturCall {
  aimedDepartureTime: string;
  expectedDepartureTime?: string;
  destinationDisplay: { frontText: string };
  quay?: { id: string };
}

interface EnturResponse {
  data?: { stopPlace?: { estimatedCalls: EnturCall[] } | null };
  errors?: { message: string }[];
}

const toDeparture = (call: EnturCall): Departure => ({
  time: call.expectedDepartureTime ?? call.aimedDepartureTime,
  destination: call.destinationDisplay.frontText,
  quay: call.quay?.id ?? '',
});

export async function GET(request: Request) {
  const stop = new URL(request.url).searchParams.get('stop') ?? '';
  if (!STOP_ID_PATTERN.test(stop)) return respond<DeparturesResponse>({ departures: [], error: 'Invalid stop' }, 400);

  try {
    const response = await fetch(ENTUR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ET-Client-Name': env.entur.clientName },
      body: JSON.stringify({
        query: QUERY,
        variables: { id: stop, count: DEPARTURE_COUNT, range: TIME_RANGE_SECONDS, modes: RAIL_MODES },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!response.ok) throw new Error(`Entur responded ${response.status}`);

    const { data, errors }: EnturResponse = await response.json();
    if (errors?.length) throw new Error('Entur returned GraphQL errors');

    return respond<DeparturesResponse>({ departures: (data?.stopPlace?.estimatedCalls ?? []).map(toDeparture) });
  } catch (error) {
    console.error('Departures fetch failed:', error instanceof Error ? error.message : error);
    return respond<DeparturesResponse>({ departures: [], error: 'Departures unavailable' });
  }
}
