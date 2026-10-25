import { expect, test } from 'bun:test';
import type { WeatherHour } from '@/lib/types';
import { conditionWord, conditionsAt, feelsLike, hourAt, laterForecast, precipSpell } from './forecast';

const hour = (h: number, precipitation: number, symbol = precipitation > 0 ? 'rain' : 'cloudy'): WeatherHour => ({
  time: new Date(2026, 9, 25, h).toISOString(),
  temperatureC: 8,
  wind: 6,
  precipitation,
  cloud: 0,
  symbol,
});

test('wind chill applies at 10° and below with wind', () => {
  expect(Math.round(feelsLike(8, 6))).toBe(5);
  expect(feelsLike(15, 10)).toBe(15);
  expect(feelsLike(-5, 1)).toBe(-5);
});

test('condition words cover precipitation before cloud cover', () => {
  expect(conditionWord('lightrainshowers_night')).toBe('regn');
  expect(conditionWord('heavysleet')).toBe('sludd');
  expect(conditionWord('snowshowers_day')).toBe('snø');
  expect(conditionWord('fair_day')).toBe('lettskyet');
  expect(conditionWord('cloudy')).toBe('skyet');
});

test('says when ongoing precipitation stops', () => {
  expect(precipSpell([hour(21, 0.4), hour(22, 1), hour(23, 0.2), hour(0, 0)])).toBe('regn til kl 00');
});

test('says when precipitation starts within six hours', () => {
  expect(precipSpell([hour(7, 0), hour(8, 0), hour(9, 0.5, 'snow')])).toBe('snø fra kl 09');
  expect(precipSpell([hour(7, 0), hour(8, 0.1), hour(9, 0)])).toBeNull();
});

test('conditions take the wettest hour within two hours of leaving', () => {
  const hours = [hour(20, 0), hour(21, 0), hour(22, 1.4), hour(23, 0.3), hour(0, 3)];
  const c = conditionsAt(hours, new Date(2026, 9, 25, 21, 5));
  expect(c?.maxPrecip).toBe(1.4);
  expect(c?.precip).toBe('rain');
  expect(conditionsAt([], new Date())).toBeNull();
});

test('picks the hour that covers now', () => {
  const hours = [hour(20, 0), hour(21, 0), hour(22, 0)];
  expect(hourAt(hours, new Date(2026, 9, 25, 21, 40))?.time).toBe(hours[1].time);
});

test('looks ahead to 16 before noon and to tomorrow 08 after noon', () => {
  const day = (d: number, h: number, temperatureC: number, symbol: string): WeatherHour => ({
    time: new Date(2026, 9, d, h).toISOString(), temperatureC, wind: 2, precipitation: 0, cloud: 0, symbol,
  });
  const hours = [day(26, 16, 4.4, 'fair_day'), day(27, 8, 6.6, 'cloudy')];
  expect(laterForecast(hours, new Date(2026, 9, 26, 7, 32))).toBe('kl 16 4° lettskyet');
  expect(laterForecast(hours, new Date(2026, 9, 26, 20, 55))).toBe('i morgen kl 08 7° skyet');
  expect(laterForecast([], new Date(2026, 9, 26, 20, 55))).toBeNull();
});
