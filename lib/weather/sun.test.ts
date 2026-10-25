import { expect, test } from 'bun:test';
import { hourLabel } from '@/lib/time';
import { lightAt, sunAltitude, sunLine } from './sun';

const at = (d: number, h: number, m = 0) => new Date(`2026-10-${d}T${hourLabel(h)}:${hourLabel(m)}:00+01:00`);

test('the late October noon sun at Røa sits low but well up', () => {
  expect(sunAltitude(at(26, 12))).toBeGreaterThan(14);
  expect(sunAltitude(at(26, 12))).toBeLessThan(19);
  expect(lightAt(at(26, 12))).toBe(1);
  expect(lightAt(at(26, 22))).toBe(0);
});

test('shows the next sunrise at night and the sunset during the day', () => {
  expect(sunLine(at(26, 5))).toMatch(/^sol opp 07:2\d$/);
  expect(sunLine(at(26, 12))).toMatch(/^sol ned 16:[34]\d$/);
  expect(sunLine(at(26, 21))).toMatch(/^sol opp 07:2\d$/);
});
