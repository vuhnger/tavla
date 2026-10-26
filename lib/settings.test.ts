import { expect, test } from 'bun:test';
import { ALL_QUAYS } from '@/lib/constants/departures';
import { DEFAULT_SETTINGS } from '@/lib/constants/settings';
import { parseSettings } from './settings';

const majorstuen = { stop: { id: 'NSR:StopPlace:58381', name: 'Majorstuen' }, quay: 'NSR:Quay:1', walk: 7, dayOff: { from: 8, to: 16 } };

test('falls back to the defaults for missing or broken storage', () => {
  expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings('{oops')).toEqual(DEFAULT_SETTINGS);
  expect(parseSettings('42')).toEqual(DEFAULT_SETTINGS);
});

test('keeps valid settings and replaces each invalid field on its own', () => {
  expect(parseSettings(JSON.stringify(majorstuen))).toEqual(majorstuen);
  expect(parseSettings(JSON.stringify({ ...majorstuen, walk: 90 })).walk).toBe(DEFAULT_SETTINGS.walk);
  expect(parseSettings(JSON.stringify({ ...majorstuen, walk: 2.5 })).walk).toBe(DEFAULT_SETTINGS.walk);
  const badStop = parseSettings(JSON.stringify({ ...majorstuen, stop: { id: 'x', name: 'y' } }));
  expect(badStop).toEqual({ ...DEFAULT_SETTINGS, walk: 7, dayOff: majorstuen.dayOff });
  expect(parseSettings(JSON.stringify({ ...majorstuen, quay: 'x' })).quay).toBe(ALL_QUAYS);
});

const withDayOff = (dayOff: unknown) => parseSettings(JSON.stringify({ ...majorstuen, dayOff })).dayOff;

test('gives old settings without dayOff the default window', () => {
  const { dayOff, ...old } = majorstuen;
  expect(parseSettings(JSON.stringify(old)).dayOff).toEqual({ from: 9, to: 15 });
});

test('keeps null as off and valid windows as stored', () => {
  expect(withDayOff(null)).toBeNull();
  expect(withDayOff({ from: 0, to: 23 })).toEqual({ from: 0, to: 23 });
});

test('replaces an invalid dayOff with the default', () => {
  const fallback = DEFAULT_SETTINGS.dayOff;
  expect(withDayOff({ from: 15, to: 9 })).toEqual(fallback);
  expect(withDayOff({ from: 9, to: 9 })).toEqual(fallback);
  expect(withDayOff({ from: -1, to: 5 })).toEqual(fallback);
  expect(withDayOff({ from: 5, to: 24 })).toEqual(fallback);
  expect(withDayOff({ from: 8.5, to: 12 })).toEqual(fallback);
  expect(withDayOff({ from: '9', to: 15 })).toEqual(fallback);
  expect(withDayOff({ from: 9 })).toEqual(fallback);
  expect(withDayOff('x')).toEqual(fallback);
});
