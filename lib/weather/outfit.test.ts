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
  expect(words({ feels: -8, temperature: -6 })).toEqual(['vinterjakke', 'ull', 'lue', 'skjerf', 'votter']);
});

test('rain in windy weather gives a rain jacket, calm weather an umbrella', () => {
  const rain = { temperature: 8, feels: 5, maxPrecip: 0.8, precip: 'rain' as const };
  expect(words({ ...rain, wind: 6 }, { dark: true, sunny: false })).toEqual(['regnjakke', 'lue', 'refleks']);
  expect(words({ ...rain, wind: 3 })).toEqual(['jakke', 'paraply', 'lue']);
});

test('snow and slush change the footwear', () => {
  expect(words({ temperature: -2, feels: -2, maxPrecip: 0.4, precip: 'snow' })).toEqual([
    'vinterjakke',
    'lue',
    'skjerf',
    'votter',
    'støvler',
    'brodder',
  ]);
  expect(words({ temperature: 1, feels: 1, maxPrecip: 1.2, precip: 'sleet', wind: 7 })).toContain('brodder');
});

test('sunglasses only when sunny and warm', () => {
  expect(words({ temperature: 20, feels: 20 }, { dark: false, sunny: true })).toEqual(['t-skjorte', 'solbriller']);
  expect(words({ temperature: 10, feels: 10 }, { dark: false, sunny: true })).toEqual(['jakke']);
});

test('a dark evening adds the reflector', () => {
  const evening = { time: new Date(2026, 9, 26, 21).toISOString(), temperatureC: 8, wind: 2, precipitation: 0, cloud: 0, symbol: 'cloudy' };
  expect(outfitAt([evening], new Date(2026, 9, 26, 21, 10))?.reflector).toBe(true);
  expect(outfitAt([], new Date(2026, 9, 26, 21, 10))).toBeNull();
});
