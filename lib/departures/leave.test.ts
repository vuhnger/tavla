import { expect, test } from 'bun:test';
import { ALL_QUAYS } from '@/lib/constants/departures';
import type { Departure } from '@/lib/types';
import { minutesUntil, upcomingLeaves } from './leave';

const at = (h: number, m: number, s = 0) => new Date(2026, 9, 26, h, m, s);
const departure = (time: Date, quay = 'in'): Departure => ({ destination: quay, quay, time: time.toISOString() });

test('leave time is the departure minus the walk, rounded down to the minute', () => {
  const [first] = upcomingLeaves([departure(at(21, 21, 30))], at(20, 55), 'in', 16, 6);
  expect(first.leaveAt).toEqual(at(21, 5));
  const [slow] = upcomingLeaves([departure(at(21, 21, 30))], at(20, 55), 'in', 20, 6);
  expect(slow.leaveAt).toEqual(at(21, 1));
});

test('drops trains you can no longer reach on foot and keeps the current minute', () => {
  const trains = [departure(at(21, 6)), departure(at(21, 21)), departure(at(21, 36))];
  const leaves = upcomingLeaves(trains, at(21, 5, 40), 'in', 16, 6);
  expect(leaves.map((l) => l.leaveAt)).toEqual([at(21, 5), at(21, 20)]);
  expect(minutesUntil(leaves[0].leaveAt, at(21, 5, 40))).toBe(0);
});

test('filters by platform, sorts by departure and caps the count', () => {
  const trains = [departure(at(22, 0)), departure(at(21, 40), 'out'), departure(at(21, 30))];
  expect(upcomingLeaves(trains, at(21, 0), 'in', 16, 6).map((l) => l.departAt)).toEqual([at(21, 30), at(22, 0)]);
  expect(upcomingLeaves(trains, at(21, 0), 'out', 16, 6).map((l) => l.departAt)).toEqual([at(21, 40)]);
  expect(upcomingLeaves(trains, at(21, 0), ALL_QUAYS, 16, 6)).toHaveLength(3);
  expect(upcomingLeaves(trains, at(21, 0), ALL_QUAYS, 16, 2)).toHaveLength(2);
});

test('shows one row when two trains leave in the same minute', () => {
  const trains = [departure(at(22, 21, 10), 'in'), departure(at(22, 21, 40), 'out'), departure(at(22, 24), 'in')];
  expect(upcomingLeaves(trains, at(22, 0), ALL_QUAYS, 7, 6).map((l) => l.departAt)).toEqual([at(22, 21, 10), at(22, 24)]);
});

test('counts minutes from the start of the current minute', () => {
  expect(minutesUntil(at(21, 5), at(20, 55, 59))).toBe(10);
});
