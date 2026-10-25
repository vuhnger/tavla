import { NextResponse } from 'next/server';

export const respond = <T>(body: T, status = 200, cacheControl = 'no-store') =>
  NextResponse.json<T>(body, { status, headers: { 'Cache-Control': cacheControl } });
