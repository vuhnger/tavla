import { expect, test } from 'bun:test';
import { ALL_QUAYS } from '@/lib/constants/departures';
import { DEFAULT_SETTINGS } from '@/lib/constants/settings';
import { parseSettings } from './settings';

const majorstuen = { stop: { id: 'NSR:StopPlace:58381', name: 'Majorstuen' }, quay: 'NSR:Quay:1', walk: 7 };

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
  expect(badStop).toEqual({ ...DEFAULT_SETTINGS, walk: 7 });
  expect(parseSettings(JSON.stringify({ ...majorstuen, quay: 'x' })).quay).toBe(ALL_QUAYS);
});
