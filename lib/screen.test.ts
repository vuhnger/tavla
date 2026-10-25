import { expect, test } from 'bun:test';
import { isScreenOff } from './screen';

test('turns the screen off from midnight until six in Oslo', () => {
  expect(isScreenOff(new Date('2026-10-25T23:00:00Z'))).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T04:59:00Z'))).toBe(true);
  expect(isScreenOff(new Date('2026-10-26T05:00:00Z'))).toBe(false);
  expect(isScreenOff(new Date('2026-10-25T22:59:00Z'))).toBe(false);
  expect(isScreenOff(new Date('2026-07-01T03:59:00Z'))).toBe(true);
  expect(isScreenOff(new Date('2026-07-01T04:00:00Z'))).toBe(false);
});
