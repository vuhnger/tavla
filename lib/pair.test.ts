import { expect, test } from 'bun:test';
import { NextResponse } from 'next/server';
import { keepPaired, matchesKey } from './pair';

test('accepts only the exact key', () => {
  expect(matchesKey('a1b2c3d4e5f60718', 'a1b2c3d4e5f60718')).toBe(true);
  expect(matchesKey('a1b2c3d4e5f60719', 'a1b2c3d4e5f60718')).toBe(false);
  expect(matchesKey('a1b2', 'a1b2c3d4e5f60718')).toBe(false);
  expect(matchesKey(undefined, 'a1b2c3d4e5f60718')).toBe(false);
});

test('never pairs when no key is configured', () => {
  expect(matchesKey('', '')).toBe(false);
  expect(matchesKey('anything', '')).toBe(false);
});

test('pairing renews the cookie for another 400 days', () => {
  const cookie = keepPaired(NextResponse.json({}), 'a1b2c3d4e5f60718').headers.get('set-cookie') ?? '';
  expect(cookie).toContain('tavla_key=a1b2c3d4e5f60718');
  expect(cookie).toContain('Max-Age=34560000');
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('Secure');
});
