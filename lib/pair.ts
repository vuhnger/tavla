import { timingSafeEqual } from 'node:crypto';

export function matchesKey(given: string | undefined, key: string): boolean {
  if (!given || !key) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}
