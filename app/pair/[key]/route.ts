import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { keepPaired, matchesKey } from '@/lib/pair';

export async function GET(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!matchesKey(key, env.pairKey)) return new NextResponse(null, { status: 404 });
  return keepPaired(NextResponse.redirect(new URL('/', request.url)), key);
}
