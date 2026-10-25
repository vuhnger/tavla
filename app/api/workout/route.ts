import type { NextRequest } from 'next/server';
import { REQUEST_TIMEOUT_MS } from '@/lib/constants/http';
import { PAIR_COOKIE } from '@/lib/constants/workout';
import { env } from '@/lib/env';
import { keepPaired, matchesKey } from '@/lib/pair';
import { respond } from '@/lib/respond';
import type { WorkoutResponse } from '@/lib/types';
import { parsePlan } from '@/lib/workout/parse';

async function plan() {
  try {
    const response = await fetch(env.garmin.icalUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Garmin responded ${response.status}`);
    return respond<WorkoutResponse>({ workouts: parsePlan(await response.text()) });
  } catch (error) {
    console.error('Workout fetch failed:', error instanceof Error ? error.name : error);
    return respond<WorkoutResponse>({ workouts: [], error: 'Workouts unavailable' }, 502);
  }
}

export async function GET(request: NextRequest) {
  const key = request.cookies.get(PAIR_COOKIE)?.value ?? '';
  if (!matchesKey(key, env.pairKey)) return respond<WorkoutResponse>({ workouts: [] }, 401);
  return keepPaired(await plan(), key);
}
