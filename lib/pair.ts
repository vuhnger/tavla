import { timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';
import { PAIR_COOKIE, PAIR_MAX_AGE_SECONDS } from '@/lib/constants/workout';

export function matchesKey(given: string | undefined, key: string): boolean {
  if (!given || !key) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function keepPaired(response: NextResponse, key: string) {
  response.cookies.set(PAIR_COOKIE, key, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: PAIR_MAX_AGE_SECONDS,
  });
  return response;
}
