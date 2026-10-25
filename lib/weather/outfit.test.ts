import { expect, test } from 'bun:test';
import type { Conditions } from './forecast';
import { outfitAt, outfitFor, outfitWords } from './outfit';

const dry: Conditions = { temperature: 14, wind: 2, feels: 14, maxPrecip: 0, precip: 'none', symbol: 'fair_day' };
const day = { dark: false, sunny: false };

const words = (c: Partial<Conditions>, light = day) => outfitWords(outfitFor({ ...dry, ...c }, light));

test('feels-like picks the jacket', () => {
  expect(words({ feels: 22, temperature: 22 })).toEqual(['t-skjorte']);
  expect(words({})).toEqual(['lett jakke']);
  expect(words({ feels: 8, temperature: 8 })).toEqual(['jakke']);
  expect(words({ feels: -8, temperature: -6 })).toEqual(['lue', 'skjerf', 'vinterjakke', 'ull', 'votter']);
});

test('rain in windy weather gives a rain jacket, calm weather an umbrella', () => {
  const rain = { temperature: 8, feels: 5, maxPrecip: 0.8, precip: 'rain' as const };
  expect(words({ ...rain, wind: 6 }, { dark: true, sunny: false })).toEqual(['lue', 'regnjakke', 'refleks']);
  expect(words({ ...rain, wind: 3 })).toEqual(['lue', 'jakke', 'paraply']);
});

test('snow and slush change the footwear', () => {
  expect(words({ temperature: -2, feels: -2, maxPrecip: 0.4, precip: 'snow' })).toEqual([
    'lue',
    'skjerf',
    'vinterjakke',
    'votter',
    'støvler',
    'brodder',
  ]);
  expect(words({ temperature: 1, feels: 1, maxPrecip: 1.2, precip: 'sleet', wind: 7 })).toContain('brodder');
});

test('sunglasses only when sunny and warm', () => {
  expect(words({ temperature: 20, feels: 20 }, { dark: false, sunny: true })).toEqual(['solbriller', 't-skjorte']);
  expect(words({ temperature: 10, feels: 10 }, { dark: false, sunny: true })).toEqual(['jakke']);
});

test('lists clothes from head to toe', () => {
  const downpour = { temperature: 7, feels: 5, maxPrecip: 2, precip: 'rain' as const, wind: 7 };
  expect(words(downpour, { dark: true, sunny: false })).toEqual(['lue', 'regnjakke', 'støvler', 'refleks']);
});

test('a dark evening adds the reflector', () => {
  const evening = { time: new Date('2026-10-26T21:00:00+01:00').toISOString(), temperatureC: 8, wind: 2, precipitation: 0, symbol: 'cloudy' };
  expect(outfitAt([evening], new Date('2026-10-26T21:10:00+01:00'))?.reflector).toBe(true);
  expect(outfitAt([], new Date('2026-10-26T21:10:00+01:00'))).toBeNull();
});
