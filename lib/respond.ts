import { NextResponse } from 'next/server';

export const respond = <T>(body: T, status = 200) =>
  NextResponse.json<T>(body, { status, headers: { 'Cache-Control': 'no-store' } });
