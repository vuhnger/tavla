import { expect, test } from 'bun:test';
import { hourLabel } from '@/lib/time';
import type { WeatherHour } from '@/lib/types';
import { runLine } from './run';

const oslo = (d: number, h: number) => new Date(`2026-10-${d}T${hourLabel(h)}:00:00+01:00`);

const hour = (h: number, precipitation: number, wind: number, d = 26): WeatherHour => ({
  time: oslo(d, h).toISOString(),
  temperatureC: 8,
  wind,
  precipitation,
  symbol: 'cloudy',
});

const now = oslo(26, 10);

test('picks the driest hour, then the calmest, then the earliest', () => {
  expect(runLine([hour(11, 0.5, 1), hour(12, 0, 5), hour(13, 0, 3), hour(14, 0, 3)], now)).toBe('løp kl 13');
});

test('skips past hours, hours after 21 and tomorrow', () => {
  const hours = [hour(8, 0, 0), hour(15, 1, 4), hour(16, 2, 4), hour(22, 0, 0), hour(11, 0, 0, 27)];
  expect(runLine(hours, now)).toBe('løp kl 15');
});

test('keeps the current hour slot and hour 21', () => {
  expect(runLine([hour(10, 0, 1), hour(21, 0, 2)], now)).toBe('løp kl 10');
  expect(runLine([hour(21, 0, 1), hour(22, 0, 0)], oslo(26, 21))).toBeNull();
});

test('returns null with fewer than two candidates', () => {
  expect(runLine([], now)).toBeNull();
  expect(runLine([hour(15, 0, 1), hour(22, 0, 0)], now)).toBeNull();
});
