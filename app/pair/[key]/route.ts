import { NextResponse } from 'next/server';
import { PAIR_COOKIE, PAIR_MAX_AGE_SECONDS } from '@/lib/constants/workout';
import { env } from '@/lib/env';
import { matchesKey } from '@/lib/pair';

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!matchesKey(key, env.pairKey)) return new NextResponse(null, { status: 404 });

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.set(PAIR_COOKIE, key, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: PAIR_MAX_AGE_SECONDS,
  });
  return response;
}
